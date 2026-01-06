import api from "./axios";

export interface TrainingDTO {
  id: number;
  date: string;
  slot: string;
  userId: string | null;
  claimedAt: string | null;
}

export function fetchTrainings(): Promise<TrainingDTO[]> {
  return api.get("/training").then((r) => r.data);
}

export function toggleTrainingClaim(id: number): Promise<TrainingDTO> {
  return api.put(`/training/${id}`).then((r) => r.data);
}
