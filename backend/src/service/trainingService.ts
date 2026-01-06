import type { TrainingSlot as TrainingSlotModel } from "@prisma/client";
import { prisma } from "../data/index";
import ServiceError from "../core/ServiceError";

export interface TrainingDTO {
  id: number;
  date: Date;
  slot: string;
  userId: string | null;
  claimedAt: Date | null;
}

export async function getAllTrainings(): Promise<TrainingDTO[]> {
  try {
    return await prisma.trainingSlot.findMany({
      orderBy: [
        { date: "asc" },
        { slot: "asc" },
      ],
    });
  } catch (err: any) {
    throw ServiceError.internalServerError("Failed to fetch training slots");
  }
}

export async function updateTrainingClaim(
  id: number,
  username: string,
  rank: number 
): Promise<TrainingDTO> {
  let slot: TrainingSlotModel | null;
  try {
    slot = await prisma.trainingSlot.findUnique({ where: { id } });
  } catch (err: any) {
    throw ServiceError.internalServerError("Failed to lookup training slot");
  }
  if (!slot) throw ServiceError.notFound("Training slot not found");

  if (slot.userId === null) {
    let claimedCount: number;
    try {
      claimedCount = await prisma.trainingSlot.count({ where: { userId: username } });
    } catch (err: any) {
      throw ServiceError.internalServerError("Failed to count existing claims");
    }
    if (claimedCount >= 5) {
      throw ServiceError.validationFailed("You have reached the maximum of 5 claimed sessions.");
    }
    try {
      return await prisma.trainingSlot.update({
        where: { id },
        data: { userId: username, claimedAt: new Date() },
      });
    } catch (err: any) {
      throw ServiceError.internalServerError("Failed to claim training slot");
    }
  }

  if (slot.userId === username) {
    try {
      return await prisma.trainingSlot.update({
        where: { id },
        data: { userId: null, claimedAt: null },
      });
    } catch (err: any) {
      throw ServiceError.internalServerError("Failed to unclaim training slot");
    }
  }

  if (rank >= 240) {
    try {
      return await prisma.trainingSlot.update({
        where: { id },
        data: { userId: null, claimedAt: null },
      });
    } catch (err: any) {
      throw ServiceError.internalServerError("Failed to clear training slot");
    }
  }

  throw ServiceError.conflict("Training slot is already claimed by another staff member");
}
