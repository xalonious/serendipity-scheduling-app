import type { ShiftSlot as ShiftSlotModel } from "@prisma/client";
import { prisma } from "../data/index";
import ServiceError from "../core/ServiceError";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { startOfWeek, addWeeks } from "date-fns";

export interface ShiftDTO {
  id: number;
  startTime: Date;
  endTime: Date;
  userId: string | null;
  claimedAt: Date | null;
  createdAt: Date;
  rewardRobux: number | null;
}

export interface Actor {
  username: string;
  rank: number;
}

const MANAGER_RANK = 240;

const LOOKBACK_DAYS = 90;
const WEEKLY_CAP = 250;
const MIN_REWARD = 1;
const MAX_REWARD = 15;
const DEFAULT_REWARD = 5;

const HALF_LIFE_WEEKS = 8;
const P_LOW = 0.1;
const P_HIGH = 0.9;
const EPS_NARROW = 0.02;

const MIN_ROWS_FOR_MODEL = 50;
const MIN_WEEKS_FOR_MODEL = 2;

const CLAIM_OPEN_HOURS = 24;
const GRACE_MINUTES = 15;
const WEEKLY_SHIFT_LIMIT = 14;

const COOLDOWN_MINUTES = 60;

const BUSINESS_TZ = "America/New_York";


function getWeekRangeET(dUtc: Date): { weekStartUtc: Date; weekEndUtc: Date } {
  const zoned = toZonedTime(dUtc, BUSINESS_TZ); 
  const weekStartLocal = startOfWeek(zoned, { weekStartsOn: 1 }); 
  const weekEndLocal = addWeeks(weekStartLocal, 1);

  const weekStartUtc = fromZonedTime(weekStartLocal, BUSINESS_TZ);
  const weekEndUtc = fromZonedTime(weekEndLocal, BUSINESS_TZ);

  return { weekStartUtc, weekEndUtc };
}

function hourOfWeekBucketUTC(d: Date): number {
  const dowMon0 = (d.getUTCDay() + 6) % 7;
  return dowMon0 * 24 + d.getUTCHours();
}

function startOfWeekUtcMonday(d: Date): Date {
  const start = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
  const dowMon0 = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - dowMon0);
  return start;
}

function bucketsWithOverlapUTC(
  start: Date,
  end: Date
): Array<{ bucket: number; weight: number }> {
  if (!(start instanceof Date) || !(end instanceof Date) || !(start < end)) return [];
  const parts: Array<{ bucket: number; weight: number }> = [];
  const totalMs = end.getTime() - start.getTime();

  const cur = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate(),
      start.getUTCHours(),
      0,
      0,
      0
    )
  );
  if (cur.getTime() > start.getTime()) cur.setUTCHours(cur.getUTCHours() - 1);

  let windowStart = new Date(Math.max(cur.getTime(), start.getTime()));
  while (windowStart < end) {
    const windowEnd = new Date(
      Date.UTC(
        windowStart.getUTCFullYear(),
        windowStart.getUTCMonth(),
        windowStart.getUTCDate(),
        windowStart.getUTCHours() + 1,
        0,
        0,
        0
      )
    );
    const segEnd = new Date(Math.min(windowEnd.getTime(), end.getTime()));
    const overlapMs = Math.max(0, segEnd.getTime() - windowStart.getTime());
    if (overlapMs > 0) {
      parts.push({
        bucket: hourOfWeekBucketUTC(windowStart),
        weight: overlapMs / totalMs,
      });
    }
    windowStart = windowEnd;
  }
  if (parts.length === 0) parts.push({ bucket: hourOfWeekBucketUTC(start), weight: 1 });
  return parts;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined)
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  return sorted[base];
}

async function computeScarcityVector(
  now = new Date()
): Promise<{ scarcity: number[]; hasHistory: boolean }> {
  const since = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const history = await prisma.historicalShift.findMany({
    where: { startTime: { gte: since } },
    select: { startTime: true, bucket: true },
  });

  const distinctWeeksTouched = new Set(
    history.map((h) => startOfWeekUtcMonday(h.startTime).getTime())
  ).size;

  if (history.length < MIN_ROWS_FOR_MODEL || distinctWeeksTouched < MIN_WEEKS_FOR_MODEL) {
    return { scarcity: Array(168).fill(0.5), hasHistory: false };
  }

  const weeks: Date[] = [];
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  let w = startOfWeekUtcMonday(since);
  const nowW = startOfWeekUtcMonday(now);
  while (w <= nowW) {
    weeks.push(new Date(w.getTime()));
    w.setUTCDate(w.getUTCDate() + 7);
  }

  const weightForWeek = (wk: Date) => {
    const ageWeeks = (nowW.getTime() - wk.getTime()) / MS_PER_WEEK;
    return Math.pow(0.5, ageWeeks / HALF_LIFE_WEEKS);
  };
  const allWeekWeight = weeks.reduce((s, wk) => s + weightForWeek(wk), 0);

  const hadWeek = Array.from({ length: 168 }, () => new Set<number>());
  for (const h of history) {
    if (h.bucket < 0 || h.bucket >= 168) continue;
    const wk = startOfWeekUtcMonday(h.startTime);
    const idx = Math.floor((wk.getTime() - weeks[0].getTime()) / MS_PER_WEEK);
    if (idx >= 0 && idx < weeks.length) hadWeek[h.bucket].add(idx);
  }

  const rawScarcity = Array.from({ length: 168 }, (_, b) => {
    const coveredWeight = Array.from(hadWeek[b]).reduce(
      (s, wi) => s + weightForWeek(weeks[wi]),
      0
    );
    const coverage = allWeekWeight > 0 ? coveredWeight / allWeekWeight : 0;
    return Math.min(0.95, Math.max(0.05, 1 - coverage));
  });

  const sorted = [...rawScarcity].sort((a, b) => a - b);
  const lo = quantile(sorted, P_LOW);
  const hi = quantile(sorted, P_HIGH);
  const span = hi - lo;

  const scarcity =
    span < EPS_NARROW
      ? rawScarcity.slice()
      : rawScarcity.map((v) => Math.max(0, Math.min(1, (v - lo) / (span || 1))));

  return { scarcity, hasHistory: true };
}

function rewardFromScarcity(
  parts: Array<{ bucket: number; weight: number }>,
  scarcity: number[],
  hasHistory: boolean
): number {
  if (!hasHistory) return DEFAULT_REWARD;
  const s = parts.reduce(
    (sum, p) => sum + (scarcity[p.bucket] ?? 0.5) * p.weight,
    0
  );
  const raw = MIN_REWARD + s * (MAX_REWARD - MIN_REWARD);
  return Math.max(MIN_REWARD, Math.min(MAX_REWARD, Math.round(raw)));
}

function assertClaimWindow(startTime: Date, now = new Date()) {
  const ms = 60 * 60 * 1000;
  const openFrom = new Date(startTime.getTime() - CLAIM_OPEN_HOURS * ms);
  if (now < openFrom) {
    throw ServiceError.conflict(
      `Shifts can only be claimed within ${CLAIM_OPEN_HOURS} hours before the start time.`
    );
  }
  if (now >= startTime) {
    throw ServiceError.conflict("You can't claim a shift that has already started.");
  }
}

async function assertGraceNoOverlap(startTime: Date, endTime: Date, excludeId?: number) {
  const GRACE_MS = GRACE_MINUTES * 60 * 1000;
  const expandedStart = new Date(startTime.getTime() - GRACE_MS);
  const expandedEnd = new Date(endTime.getTime() + GRACE_MS);

  const overlapping = await prisma.shiftSlot.findFirst({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      startTime: { lt: expandedEnd },
      endTime: { gt: expandedStart },
    },
    select: { id: true },
  });

  if (overlapping) {
    throw ServiceError.conflict(
      `Shift must have a ${GRACE_MINUTES}-minute gap from adjacent shifts.`
    );
  }
}

async function assertWeeklyCap(username: string, startTime: Date, excludeId?: number) {
  const { weekStartUtc, weekEndUtc } = getWeekRangeET(startTime);

  const count = await prisma.shiftSlot.count({
    where: {
      userId: username,
      startTime: { gte: weekStartUtc, lt: weekEndUtc },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (count >= WEEKLY_SHIFT_LIMIT) {
    throw ServiceError.conflict(
      `You have reached the weekly hosting limit of ${WEEKLY_SHIFT_LIMIT} shifts.`
    );
  }
}

async function isWithinCooldown(
  userId: string | null,
  startTime: Date,
  excludeId?: number
) {
  if (!userId) return false;
  const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;
  const since = new Date(startTime.getTime() - COOLDOWN_MS);

  const prev = await prisma.shiftSlot.findFirst({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      userId,
      endTime: { gt: since, lte: startTime },
    },
    orderBy: { endTime: "desc" },
    select: { id: true },
  });

  return !!prev;
}

async function getWeekUsedRobux(startTime: Date, excludeId?: number): Promise<number> {
  const { weekStartUtc, weekEndUtc } = getWeekRangeET(startTime);

  const agg = await prisma.shiftSlot.aggregate({
    where: {
      startTime: { gte: weekStartUtc, lt: weekEndUtc },
      rewardRobux: { not: null },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    _sum: { rewardRobux: true },
  });

  return agg._sum.rewardRobux ?? 0;
}

export async function getAllShifts(): Promise<ShiftDTO[]> {
  try {
    return await prisma.shiftSlot.findMany({ orderBy: [{ startTime: "asc" }] });
  } catch {
    throw ServiceError.internalServerError("Failed to fetch shifts");
  }
}

export async function createShift(
  username: string,
  startTime: Date,
  endTime: Date
): Promise<ShiftDTO> {
  try {
    if (!(startTime instanceof Date) || !(endTime instanceof Date) || !(startTime < endTime)) {
      throw ServiceError.validationFailed("Invalid start/end times");
    }

    assertClaimWindow(startTime);
    await assertGraceNoOverlap(startTime, endTime);
    await assertWeeklyCap(username, startTime);

    const cooldown = await isWithinCooldown(username, startTime);
    const { scarcity, hasHistory } = await computeScarcityVector();
    const parts = bucketsWithOverlapUTC(startTime, endTime);
    const baseReward = cooldown ? 0 : rewardFromScarcity(parts, scarcity, hasHistory);

    const used = await getWeekUsedRobux(startTime);
    const remaining = Math.max(0, WEEKLY_CAP - used);
    const finalReward = Math.min(baseReward, remaining);

    return await prisma.shiftSlot.create({
      data: {
        startTime,
        endTime,
        userId: username,
        claimedAt: new Date(),
        rewardRobux: finalReward,
      },
    });
  } catch (err: any) {
    if (err instanceof ServiceError) throw err;
    throw ServiceError.internalServerError("Failed to create shift");
  }
}

export async function updateShift(
  id: number,
  actor: Actor,
  startTime: Date,
  endTime: Date
): Promise<ShiftDTO> {
  let existing: ShiftSlotModel | null;
  try {
    existing = await prisma.shiftSlot.findUnique({ where: { id } });
  } catch {
    throw ServiceError.internalServerError("Failed to lookup shift");
  }
  if (!existing) throw ServiceError.notFound("Shift not found");

  const isOwner = existing.userId === actor.username;
  const isManager = actor.rank >= MANAGER_RANK;
  if (!isOwner && !isManager) {
    throw ServiceError.forbidden("You don't have permission to edit this shift");
  }

  try {
    const invalid =
      !(startTime instanceof Date) ||
      Number.isNaN(startTime.getTime()) ||
      !(endTime instanceof Date) ||
      Number.isNaN(endTime.getTime());
    if (invalid) {
      throw ServiceError.validationFailed("Invalid start/end times");
    }

    if (!(startTime < endTime)) {
      throw ServiceError.validationFailed("End time must be after start time");
    }

    const FUTURE_ENFORCE_RANK = 240;
    if (actor.rank < FUTURE_ENFORCE_RANK) {
      const now = new Date();
      if (startTime <= now) {
        throw ServiceError.validationFailed("Updated shift must start in the future");
      }
    }

    await assertGraceNoOverlap(startTime, endTime, id);

    const ownerUsername = existing.userId ?? actor.username;
    if (existing.userId) {
      await assertWeeklyCap(ownerUsername, startTime, id);
    }

    const now = new Date();
    const canReprice = existing.startTime > now && existing.userId;

    const data: any = { startTime, endTime };

    if (canReprice) {
      const cooldown = await isWithinCooldown(existing.userId, startTime, id);
      const { scarcity, hasHistory } = await computeScarcityVector();
      const parts = bucketsWithOverlapUTC(startTime, endTime);
      const baseReward = cooldown ? 0 : rewardFromScarcity(parts, scarcity, hasHistory);

      const used = await getWeekUsedRobux(startTime, id);
      const remaining = Math.max(0, WEEKLY_CAP - used);
      const finalReward = Math.min(baseReward, remaining);

      data.rewardRobux = finalReward;
    }

    return await prisma.shiftSlot.update({
      where: { id },
      data,
    });
  } catch (err: any) {
    if (err instanceof ServiceError) throw err;
    throw ServiceError.internalServerError("Failed to update shift");
  }
}

export async function deleteShift(id: number, actor: Actor): Promise<void> {
  let existing: ShiftSlotModel | null;
  try {
    existing = await prisma.shiftSlot.findUnique({ where: { id } });
  } catch {
    throw ServiceError.internalServerError("Failed to lookup shift");
  }
  if (!existing) throw ServiceError.notFound("Shift not found");

  const isOwner = existing.userId === actor.username;
  const isManager = actor.rank >= MANAGER_RANK;
  if (!isOwner && !isManager) {
    throw ServiceError.forbidden("You don't have permission to delete this shift");
  }

  try {
    await prisma.shiftSlot.delete({ where: { id } });
  } catch {
    throw ServiceError.internalServerError("Failed to delete shift");
  }
}

export async function calculateShiftReward(
  username: string,
  startTime: Date,
  endTime: Date,
  excludeId?: number
): Promise<number> {
  const info = await calculateShiftWorthDetailed(username, startTime, endTime, excludeId);
  return info.reward;
}

export type RewardInfo = {
  reward: number;
  cooldown: boolean;
  poolEmpty: boolean;
};

export async function calculateShiftWorthDetailed(
  username: string,
  startTime: Date,
  endTime: Date,
  excludeId?: number
): Promise<RewardInfo> {
  if (!(startTime instanceof Date) || !(endTime instanceof Date) || !(startTime < endTime)) {
    throw ServiceError.validationFailed("Invalid start/end times");
  }

  const cooldown = await isWithinCooldown(username, startTime, excludeId);
  if (cooldown) {
    return { reward: 0, cooldown: true, poolEmpty: false };
  }

  const { scarcity, hasHistory } = await computeScarcityVector();
  const parts = bucketsWithOverlapUTC(startTime, endTime);
  const base = rewardFromScarcity(parts, scarcity, hasHistory);

  const used = await getWeekUsedRobux(startTime, excludeId);
  const remaining = Math.max(0, WEEKLY_CAP - used);

  const reward = Math.min(base, remaining);
  const poolEmpty = reward === 0 && remaining <= 0;

  return { reward, cooldown: false, poolEmpty };
}
