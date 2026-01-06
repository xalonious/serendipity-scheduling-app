import express, { Request, Response } from "express";
import { requireAuthentication, requireMinRank } from "../core/authMiddleware";
import { validateRequest } from "../core/validation";
import asyncHandler from "../utils/asyncHandler";
import { trainingParamsSchema } from "../validation/trainingValidation";
import * as trainingService from "../service/trainingService";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res: Response) => {
    const trainings = await trainingService.getAllTrainings();
    res.status(200).json(trainings);
  })
);

router.put(
  "/:id",
  requireAuthentication,
  requireMinRank(210),
  validateRequest({ params: trainingParamsSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { username, rank } = res.locals.user as { username: string; rank: number };
    const updated = await trainingService.updateTrainingClaim(id, username, rank);
    res.status(200).json(updated);
  })
);

export default router;
