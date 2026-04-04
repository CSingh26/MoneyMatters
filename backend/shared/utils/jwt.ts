import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types';

export function signAccessToken(
  payload: Pick<JwtPayload, 'userId' | 'email'>,
  secret: string,
  expiresIn: SignOptions['expiresIn'] = '15m',
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function signRefreshToken(
  payload: Pick<JwtPayload, 'userId' | 'email'>,
  secret: string,
  expiresIn: SignOptions['expiresIn'] = '7d',
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
