import type { Express } from 'express';
import gameRouter from './game';
import healthRouter from './health';
import trainingRouter from './trainingRouter'
import authRouter from './authRouter';
import shiftRouter from './shiftRouter';
import { authApi } from '../core/authMiddleware';
import { errorHandler } from '../core/errorHandler';

export default function installRest(app: Express) {
  app.use('/api/health', healthRouter);
  app.use('/api/game', authApi, gameRouter);
  app.use('/api/training', trainingRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/shift', shiftRouter);
  app.use(errorHandler);
}
