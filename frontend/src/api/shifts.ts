import api from "./axios";

export interface ShiftDTO {
  id: number;
  startTime: string;
  endTime: string;
  userId: string | null;
  claimedAt: string | null;
  createdAt: string;
}

export type RewardInfo = {
  reward: number;
  cooldown: boolean;
  poolEmpty: boolean;
};

export function fetchShifts(): Promise<ShiftDTO[]> {
  return api.get("/shift").then((r) => r.data);
}

export function createShift(
  startTime: string,
  endTime: string
): Promise<ShiftDTO> {
  return api.post("/shift", { startTime, endTime }).then((r) => r.data);
}

export function updateShift(
  id: number,
  startTime: string,
  endTime: string
): Promise<ShiftDTO> {
  return api.patch(`/shift/${id}`, { startTime, endTime }).then((r) => r.data);
}

export function deleteShift(id: number): Promise<void> {
  return api.delete(`/shift/${id}`).then(() => {});
}

export function getShiftReward(
  startTime: string,
  endTime: string,
  excludeId?: number
): Promise<RewardInfo> {
  const params = new URLSearchParams({ startTime, endTime });
  if(excludeId !== undefined) {
    params.set("excludeId", String(excludeId));
  }
  return api.get(`/shift/worth?${params.toString()}`).then((r) => r.data as RewardInfo);
}
