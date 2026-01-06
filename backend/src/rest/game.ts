import express, { Request, Response } from "express";
import { validateRequest } from "../core/validation";
import asyncHandler from "../utils/asyncHandler";
import {
  changeRankBodySchema,
  getGamePassesQuerySchema,
  getUserGamesQuerySchema,
  getSpecialTagQuerySchema,
  webhookProxyQuerySchema,
  webhookProxyBodySchema,
} from "../validation/gameRoutes";
import * as gameService from "../service/gameService";

const router = express.Router();

router.post(
  "/changerank",
  validateRequest({ body: changeRankBodySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { groupId, userid, role } = req.body as {
      groupId: number;
      userid: number;
      role: number;
    };
    await gameService.changeUserRank(groupId, userid, role);
    res.status(200).json({ message: "Rank changed successfully" });
  }),
);

router.get(
  "/getgamepasses",
  validateRequest({ query: getGamePassesQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { universeid } = req.query as { universeid: string };
    const data = await gameService.fetchGamePasses(universeid);
    res.status(200).json(data);
  }),
);

router.get(
  "/getgames",
  validateRequest({ query: getUserGamesQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { userid } = req.query as { userid: string };
    const data = await gameService.fetchUserGames(userid);
    res.status(200).json(data);
  }),
);

router.get(
  "/getspecialtag",
  validateRequest({ query: getSpecialTagQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { user } = req.query as { user: string };
    const tagData = await gameService.fetchSpecialTag(user);
    res.status(200).json(tagData);
  }),
);

router.post(
  "/webhookproxy",
  validateRequest({
    query: webhookProxyQuerySchema,
    body:  webhookProxyBodySchema,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { url } = req.query as { url: string };
    const { content, embed } = req.body as { content?: string; embed?: any };
    const result = await gameService.proxyWebhook(url, content, embed);
    res.status(result.status).json(result.body);
  }),
);

export default router;
