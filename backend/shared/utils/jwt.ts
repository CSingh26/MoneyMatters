import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export function signAccessToken(
  payload: Pick<JwtPayload, 'userId' | 'email'>,
  secret: string,
  expiresIn: string = '15m',
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function signRefreshToken(
  payload: Pick<JwtPayload, 'userId' | 'email'>,
  secret: string,
  expiresIn: string = '7d',
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
