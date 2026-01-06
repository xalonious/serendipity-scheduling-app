import { prisma } from "./index";
import * as fs from "fs";
import * as path from "path";
import moment from "moment-timezone";

const LOOKBACK_DAYS = 90;

function hourOfWeekBucketUTC(d: Date): number {
  const dowMon0 = (d.getUTCDay() + 6) % 7;
  return dowMon0 * 24 + d.getUTCHours();
}

function diffMinutes(a: Date, b: Date): number {
  return Math.max(15, Math.round((b.getTime() - a.getTime()) / 60000));
}

function mondayUtc(d: Date): Date {
  const m = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
  const dowMon0 = (m.getUTCDay() + 6) % 7;
  m.setUTCDate(m.getUTCDate() - dowMon0);
  return m;
}

function weekKey(date: Date): string {
  const m = mondayUtc(date);
  return `${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, "0")}-${String(
    m.getUTCDate()
  ).padStart(2, "0")}`;
}

function addDaysUtc(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function yyyymmdd(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

function yyyymmddHHMMSS(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate()
  )}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
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

async function main() {
  await prisma.$connect();

  const cutoffUtc: Date = moment.tz("America/New_York").startOf("day").toDate();

  const pastShifts = await prisma.shiftSlot.findMany({
    where: { endTime: { lt: cutoffUtc } },
    orderBy: [{ startTime: "asc" }],
  });

  const claimable = pastShifts.filter((s) => s.userId);
  const pastUnclaimed = pastShifts.filter((s) => !s.userId);

  const archiveRows: Array<{
    startTime: Date;
    endTime: Date;
    hostUserId: string;
    bucket: number;
    durationMins: number;
    rewardRobux: number | null;
  }> = [];

  for (const s of claimable) {
    const userId = String(s.userId);

    const reward = s.rewardRobux ?? 0;

    const parts = bucketsWithOverlapUTC(s.startTime, s.endTime);

    parts.forEach((p, idx) => {
      archiveRows.push({
        startTime: s.startTime,
        endTime: s.endTime,
        hostUserId: userId,
        bucket: p.bucket,
        durationMins: diffMinutes(s.startTime, s.endTime),
        rewardRobux: idx === 0 ? reward : null,
      });
    });
  }

  if (archiveRows.length || pastUnclaimed.length) {
    const idsToDelete = [
      ...claimable.map((s) => s.id),
      ...pastUnclaimed.map((s) => s.id),
    ];

    await prisma.$transaction([
      ...(archiveRows.length
        ? [prisma.historicalShift.createMany({ data: archiveRows })]
        : []),
      prisma.shiftSlot.deleteMany({ where: { id: { in: idsToDelete } } }),
    ]);
  }

  const cutoffHistory = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const purge = await prisma.historicalShift.deleteMany({
    where: { startTime: { lt: cutoffHistory } },
  });

  const runTag = `run-${yyyymmddHHMMSS(new Date())}`;
  const byWeek = new Map<string, Map<string, { shifts: number; robux: number }>>();

  for (const row of archiveRows) {
    if (row.rewardRobux == null || row.rewardRobux <= 0) continue;

    const wk = weekKey(row.startTime);
    if (!byWeek.has(wk)) byWeek.set(wk, new Map());
    const perUser = byWeek.get(wk)!;

    const u = row.hostUserId;
    const cur = perUser.get(u) ?? { shifts: 0, robux: 0 };
    cur.shifts += 1;
    cur.robux += row.rewardRobux;
    perUser.set(u, cur);
  }

  const outDir = path.join(__dirname, "../../exports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const weeklyFiles: string[] = [];
  for (const [wk, perUser] of byWeek.entries()) {
    const weekStart = mondayUtc(new Date(wk));
    const weekEnd = addDaysUtc(weekStart, 7);
    const base = `robux-week-${yyyymmdd(weekStart)}_to_${yyyymmdd(weekEnd)}`;
    const file = path.join(outDir, `${base}__${runTag}.csv`);

    const lines: string[][] = [
      ["userId", "totalShifts", "totalRobux", "weekStartUTC", "weekEndUTC", "runTag"],
    ];
    for (const [userId, t] of Array.from(perUser.entries()).sort(
      (a, b) => b[1].robux - a[1].robux
    )) {
      lines.push([
        userId,
        String(t.shifts),
        String(t.robux),
        yyyymmdd(weekStart),
        yyyymmdd(weekEnd),
        runTag,
      ]);
    }

    const csv = lines
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    fs.writeFileSync(file, csv, "utf8");
    weeklyFiles.push(file);
  }

  const totals = new Map<string, { shifts: number; robux: number }>();
  const files = fs.existsSync(outDir) ? fs.readdirSync(outDir) : [];
  const weeklyPattern =
    /^robux-week-\d{4}-\d{2}-\d{2}_to_\d{4}-\d{2}-\d{2}(?:__.+)?\.csv$/;

  for (const f of files) {
    if (!weeklyPattern.test(f)) continue;
    const content = fs.readFileSync(path.join(outDir, f), "utf8");
    const lines = content.split(/\r?\n/).filter(Boolean);
    if (lines.length <= 1) continue;

    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i];
      const cells = raw.split(",").map((c) => c.replace(/^"(.*)"$/, "$1"));
      const userId = cells[0] ?? "";
      const totalShifts = Number(cells[1] ?? "0") || 0;
      const totalRobux = Number(cells[2] ?? "0") || 0;

      const cur = totals.get(userId) ?? { shifts: 0, robux: 0 };
      cur.shifts += totalShifts;
      cur.robux += totalRobux;
      totals.set(userId, cur);
    }
  }

  const totalsFile = path.join(outDir, `robux-totals.csv`);
  const totalsLines: string[][] = [["userId", "totalShifts", "totalRobux", "asOfUTC"]];
  const asOf = new Date();

  for (const [userId, t] of Array.from(totals.entries()).sort(
    (a, b) => b[1].robux - a[1].robux
  )) {
    totalsLines.push([userId, String(t.shifts), String(t.robux), yyyymmdd(asOf)]);
  }

  fs.writeFileSync(
    totalsFile,
    totalsLines
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n"),
    "utf8"
  );

  console.log(
    `✅ Archived ${claimable.length} past claimed shifts into ${archiveRows.length} rows, deleted ${pastUnclaimed.length} past unclaimed, purged ${purge.count} old rows.`
  );
  if (weeklyFiles.length) {
    console.log("📄 Weekly CSV(s):");
    for (const f of weeklyFiles) console.log(" - " + f);
  }
  console.log("📈 Running totals CSV: " + totalsFile);
}

main()
  .catch(async (e) => {
    console.error("Reset & store failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
