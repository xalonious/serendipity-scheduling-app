import config from 'config';
import jwt, {
  type Secret,
  type SignOptions,
  type VerifyOptions,
  type JwtPayload,
} from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  username: string;
  rank: number;
  picture?: string | null;
}

interface JwtConfig {
  secret: string;
  expirationInterval: string | number;
  issuer: string;
  audience: string;
}

const {
  secret: JWT_SECRET,
  expirationInterval: JWT_EXPIRY,
  issuer:   JWT_ISSUER,
  audience: JWT_AUDIENCE,
} = config.get<JwtConfig>('auth.jwt');

const signJWT = (
  payload: object,
  secretOrPrivateKey: Secret,
  options?: SignOptions
): Promise<string> =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, secretOrPrivateKey, options ?? {}, (err, token) => {
      if (err) reject(err);
      else resolve(token as string);
    })
  );

const verifyJWT = (
  token: string,
  secretOrPublicKey: Secret,
  options?: VerifyOptions
): Promise<JwtPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, secretOrPublicKey, options ?? {}, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded as JwtPayload);
    })
  );

export const generateJWT = async (user: AuthUser): Promise<string> => {
  const payload = {
    sub:     user.id.toString(),
    username:user.username,
    rank:    user.rank,
    picture: user.picture ?? null,
  };
  const options: SignOptions = {
    expiresIn: JWT_EXPIRY as SignOptions['expiresIn'],
    issuer:    JWT_ISSUER,
    audience:  JWT_AUDIENCE,
  };
  return signJWT(payload, JWT_SECRET as Secret, options);
};

export const verifyJWTToken = async (token: string): Promise<JwtPayload> => {
  const options: VerifyOptions = {
    issuer:   JWT_ISSUER,
    audience: JWT_AUDIENCE,
  };
  return verifyJWT(token, JWT_SECRET as Secret, options);
};
