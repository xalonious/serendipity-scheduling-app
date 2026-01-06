import axios from "axios";
import querystring from "querystring";
import * as noblox from "noblox.js";
import ServiceError from "../core/ServiceError";
import config from "config";
import dotenv from "dotenv";
dotenv.config();

const CLIENT_ID     = process.env.ROBLOX_CLIENT_ID!;
const CLIENT_SECRET = process.env.ROBLOX_CLIENT_SECRET!;
export const REDIRECT_URI  = config.get<string>("auth.oauth.redirectUri");

export const GROUP_ID = 4346739;
export const MIN_RANK = 200;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("Missing or invalid env var: ROBLOX_CLIENT_ID, ROBLOX_CLIENT_SECRET");
}

const AUTHZ_URL    = "https://apis.roblox.com/oauth/v1/authorize";
const TOKEN_URL    = "https://apis.roblox.com/oauth/v1/token";
const USERINFO_URL = "https://apis.roblox.com/oauth/v1/userinfo";

export function getAuthorizationUrl(state: string, nonce: string): string {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: "code",
    scope:         "openid profile",
    state,
    nonce,
  });
  return `${AUTHZ_URL}?${params.toString()}`;
}

export interface OAuthTokens {
  accessToken:  string;
  refreshToken?: string; 
  expiresIn:    number;
}

export interface BuiltUser {
  id:       number;
  username: string;
  picture:  string | null;
  rank:     number;
}

function isAxiosStatus(err: any, codes: number[]) {
  return !!(axios.isAxiosError(err) && err.response && codes.includes(err.response.status));
}

export async function buildUserFromAccessToken(accessToken: string): Promise<BuiltUser> {
  let id: number, username: string, picture: string | null;
  try {
    const userRes = await axios.get(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    id       = Number(userRes.data.sub);
    username = userRes.data.preferred_username;
    picture  = userRes.data.picture ?? null;
  } catch (err) {
    if (isAxiosStatus(err, [401, 403])) {
      throw ServiceError.unauthorized("Access token is invalid or expired");
    }
    throw ServiceError.internalServerError("Failed to fetch user info");
  }

  try {
    const rank = await noblox.getRankInGroup(GROUP_ID, id);
    return { id, username, picture, rank };
  } catch {
    throw ServiceError.internalServerError("Failed to fetch group rank");
  }
}

async function exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
  try {
    const body = querystring.stringify({
      grant_type:    "authorization_code",
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
    });
    const tokenRes = await axios.post(TOKEN_URL, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const { access_token, refresh_token, expires_in } = tokenRes.data;
    return {
      accessToken:  access_token,
      refreshToken: refresh_token,
      expiresIn:    Number(expires_in),
    };
  } catch {
    throw ServiceError.internalServerError("Failed to exchange code");
  }
}

export async function processOAuthCallback(
  code: string,
  returnedState: string,
  sessionState: string
): Promise<{
  id: number; username: string; rank: number; picture: string | null; tokens: OAuthTokens;
}> {
  if (returnedState !== sessionState) {
    throw ServiceError.validationFailed("Invalid OAuth2 state");
  }

  const tokens = await exchangeCodeForTokens(code);

  const profile = await buildUserFromAccessToken(tokens.accessToken);
  if (profile.rank < MIN_RANK) {
    throw ServiceError.forbidden("Insufficient group rank");
  }

  const { id, username, rank, picture } = profile;
  return { id, username, rank, picture, tokens };
}

export async function refreshAccessToken(oldRefreshToken: string): Promise<OAuthTokens> {
  try {
    const body = querystring.stringify({
      grant_type:    "refresh_token",
      refresh_token: oldRefreshToken,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    const res = await axios.post(TOKEN_URL, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const { access_token, refresh_token, expires_in } = res.data;
    return {
      accessToken:  access_token,
      refreshToken: refresh_token, 
      expiresIn:    Number(expires_in),
    };
  } catch (err) {
    if (isAxiosStatus(err, [400, 401])) {
      throw ServiceError.unauthorized("Failed to refresh access token");
    }
    throw ServiceError.internalServerError("Token endpoint error");
  }
}
