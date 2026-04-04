import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "./config";
import { TokenPayload } from "../../../shared/types/index";

export function generateAccessToken(userId: string, email: string): string {
  const payload: TokenPayload = { sub: userId, email, type: "access" };
  const options: SignOptions = { expiresIn: config.jwtAccessExpiry as string & SignOptions["expiresIn"] };
  return jwt.sign(payload as object, config.jwtSecret, options);
}

export function generateRefreshToken(userId: string, email: string): string {
  const payload: TokenPayload = { sub: userId, email, type: "refresh" };
  const options: SignOptions = { expiresIn: config.jwtRefreshExpiry as string & SignOptions["expiresIn"] };
  return jwt.sign(payload as object, config.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}
