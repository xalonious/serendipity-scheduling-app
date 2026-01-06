import express, { Request, Response } from "express";
import { requireAuthentication } from "../core/authMiddleware";
import { validateRequest } from "../core/validation";
import asyncHandler from "../utils/asyncHandler";

import {
  shiftParamsSchema,
  shiftCreateSchema,
  shiftUpdateSchema,
  shiftWorthQuerySchema,
} from "../validation/shiftValidation";
import * as shiftService from "../service/shiftService";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const shifts = await shiftService.getAllShifts();
    res.status(200).json(shifts);
  })
);

router.get(
  "/worth",
  requireAuthentication,
  validateRequest({ query: shiftWorthQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const startTime = new Date(String(req.query.startTime));
    const endTime = new Date(String(req.query.endTime));
    const username = res.locals.user.username as string;
    const excludeId = req.query.excludeId ? Number(req.query.excludeId) : undefined;

    const info = await shiftService.calculateShiftWorthDetailed(username, startTime, endTime, excludeId);
    res.status(200).json(info);
  })
);

router.post(
  "/",
  requireAuthentication,
  validateRequest({ body: shiftCreateSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { startTime, endTime } = req.body;
    const username = res.locals.user.username;
    const newShift = await shiftService.createShift(
      username,
      new Date(startTime),
      new Date(endTime)
    );
    res.status(201).json(newShift);
  })
);

router.patch(
  "/:id",
  requireAuthentication,
  validateRequest({
    params: shiftParamsSchema,
    body: shiftUpdateSchema,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { startTime, endTime } = req.body;
    const actor = {
      username: res.locals.user.username as string,
      rank: res.locals.user.rank as number,
    };
    const updated = await shiftService.updateShift(
      id,
      actor,
      new Date(startTime),
      new Date(endTime)
    );
    res.status(200).json(updated);
  })
);

router.delete(
  "/:id",
  requireAuthentication,
  validateRequest({ params: shiftParamsSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const actor = {
      username: res.locals.user.username as string,
      rank: res.locals.user.rank as number,
    };
    await shiftService.deleteShift(id, actor);
    res.sendStatus(204);
  })
);

export default router;
