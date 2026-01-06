import session from "express-session";
import "express-serve-static-core";

declare module "express-session" {
  interface SessionData {
    oauthState: string;
    oauthNonce: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    session: session.Session & Partial<session.SessionData>;
  }
}
