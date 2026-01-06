import express, { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import crypto from 'crypto';
import session from 'express-session';
import ServiceError from '../core/ServiceError';
import {
  getAuthorizationUrl,
  processOAuthCallback,
  refreshAccessToken,
  buildUserFromAccessToken,
  MIN_RANK,
} from '../service/authService';
import { generateJWT } from '../core/authJwt';
import { requireAuthentication } from '../core/authMiddleware';

type OAuthSession = session.Session & Partial<session.SessionData> & {
  oauthState?: string;
  oauthNonce?: string;
  returnTo?:   string;
};

const router = express.Router();

const cookieCommon = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

router.get(
  '/me',
  requireAuthentication,
  asyncHandler(async (_req: Request, res: Response) => {
    const { id, username, rank, picture } = res.locals.user as {
      id: number; username: string; rank: number; picture?: string | null;
    };
    res.json({ id, username, rank, avatarUrl: picture ?? null });
  })
);

router.get(
  '/roblox',
  asyncHandler(async (req: Request, res: Response) => {
    const returnTo = (req.query.returnTo as string) || '/';
    const sep = returnTo.includes('?') ? '&' : '?';

    const rt = req.cookies.refresh_token as string | undefined;
    if (rt) {
      let tokens;
      try {
        tokens = await refreshAccessToken(rt);
      } catch (err: any) {
        if (err instanceof ServiceError && (err.isUnauthorized)) {
          res.clearCookie('refresh_token', cookieCommon); 
        }
        const state = crypto.randomBytes(16).toString('hex');
        const nonce = crypto.randomBytes(16).toString('hex');
        const sess  = req.session as OAuthSession;
        sess.oauthState = state;
        sess.oauthNonce = nonce;
        sess.returnTo   = returnTo;
        return res.redirect(getAuthorizationUrl(state, nonce));
      }

      let profile: { id: number; username: string; rank: number; picture: string | null };
      try {
        profile = await buildUserFromAccessToken(tokens.accessToken);
      } catch {
        return res.redirect(`${returnTo}${sep}loginError=temporary`);
      }

      if (profile.rank < MIN_RANK) {
        res.clearCookie('auth_token', cookieCommon);
        res.clearCookie('refresh_token', cookieCommon); 
        return res.redirect(`${returnTo}${sep}loginError=staff_only`);
      }

      if (tokens.refreshToken) {
        res.cookie('refresh_token', tokens.refreshToken, {
          ...cookieCommon,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }

      const jwtExpirySec = parseInt(process.env.JWT_EXPIRY ?? '3600', 10);
      const jwt = await generateJWT({
        id: profile.id,
        username: profile.username,
        rank: profile.rank,
        picture: profile.picture,
      });
      res.cookie('auth_token', jwt, {
        ...cookieCommon,
        maxAge: jwtExpirySec * 1000,
      });

      return res.redirect(`${returnTo}${sep}loginSuccess=1`);
    }

    const state = crypto.randomBytes(16).toString('hex');
    const nonce = crypto.randomBytes(16).toString('hex');
    const sess  = req.session as OAuthSession;
    sess.oauthState = state;
    sess.oauthNonce = nonce;
    sess.returnTo   = returnTo;
    res.redirect(getAuthorizationUrl(state, nonce));
  })
);

router.get(
  '/roblox/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const sess = req.session as OAuthSession;
    const returnTo = sess.returnTo || '/';
    const sep = returnTo.includes('?') ? '&' : '?';

    const { error, code, state } = req.query as {
      error?: string; code?: string; state?: string;
    };

    if (error) {
      return res.redirect(`${returnTo}${sep}loginError=${encodeURIComponent(error)}`);
    }
    if (!code || !state) {
      return res.status(400).send('Missing code or state');
    }
    if (sess.oauthState !== state) {
      return res.status(400).send('Invalid state; please restart login');
    }

    try {
      const { id, username, rank, picture, tokens } =
        await processOAuthCallback(code, state, sess.oauthState!);

      const jwtExpirySec = parseInt(process.env.JWT_EXPIRY ?? '3600', 10);
      const jwt = await generateJWT({ id, username, rank, picture });

      res.cookie('auth_token', jwt, {
        ...cookieCommon,
        maxAge: jwtExpirySec * 1000,
      });

      if (tokens.refreshToken) {
        res.cookie('refresh_token', tokens.refreshToken, {
          ...cookieCommon,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }

      delete sess.oauthState;
      delete sess.returnTo;

      return res.redirect(`${returnTo}${sep}loginSuccess=1`);
    } catch (err: any) {
      if (err instanceof ServiceError && err.isForbidden) {
        return res.redirect(`${returnTo}${sep}loginError=staff_only`);
      }
      throw err;
    }
  })
);

router.get(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const returnTo =
      (req.query.returnTo as string) ||
      (req.session as OAuthSession).returnTo ||
      '/';

    const hard = req.query.hard === '1' || req.query.full === '1';

    res.clearCookie('auth_token', cookieCommon);

    if (hard) {
      res.clearCookie('refresh_token', cookieCommon);
    }

    delete (req.session as OAuthSession).oauthState;
    delete (req.session as OAuthSession).returnTo;

    const sep = returnTo.includes('?') ? '&' : '?';
    res.redirect(`${returnTo}${sep}logoutSuccess=1`);
  })
);

export default router;
