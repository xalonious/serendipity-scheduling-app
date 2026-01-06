import { RequestHandler } from "express";
import dotenv from "dotenv";
import { verifyJWTToken, AuthUser } from "../core/authJwt";

dotenv.config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("Missing env var API_KEY");
}

export const authApi: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (header === `Bearer ${API_KEY}`) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export const requireAuthentication: RequestHandler = async (
  req,
  res,
  next
) => {
  let token: string | undefined;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    token = header.slice("Bearer ".length);
  } else if (req.cookies?.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    res
      .status(401)
      .json({ code: "UNAUTHORIZED", message: "Missing token" });
    return;            
  }

  try {
    const payload = await verifyJWTToken(token);
    const user: AuthUser = {
      id:       Number(payload.sub),
      username: payload.username as string,
      rank:     payload.rank as number,
      picture: payload.picture as string ?? null,
    };
    res.locals.user = user;
    next();
  } catch {
    res
      .status(401)
      .json({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
    return;           
  }
};



export const requireMinRank = (min: number): RequestHandler => (req, res, next) => {
  const user = res.locals.user as AuthUser | undefined;
  if (!user) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Missing token" });
    return;
  }
  if (typeof user.rank !== "number") {
    res.status(400).json({ code: "VALIDATION_FAILED", message: "User rank missing" });
    return;
  }
  if (user.rank < min) {
    res.status(403).json({ code: "FORBIDDEN", message: "Insufficient group rank" });
    return;
  }
  next();
};
