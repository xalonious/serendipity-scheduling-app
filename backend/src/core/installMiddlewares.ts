import type { Express } from 'express';
import express from 'express';
import config from 'config';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { loggingMiddleware } from './loggingMiddleware';

dotenv.config();

const corsOptions = {
  origin: config.get<string[]>('cors.origins'),
  credentials: config.get<boolean>('cors.credentials'),
  optionsSuccessStatus: 200
};

export default function installMiddlewares(app: Express) {
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(loggingMiddleware)
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));
}
