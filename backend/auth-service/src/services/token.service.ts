import crypto from 'node:crypto';
import { signAccessToken, signRefreshToken, verifyToken } from '../../shared/utils/jwt';
import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../models/user.model';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function generateTokenPair(userId: string, email: string) {
  const accessSecret = process.env.JWT_ACCESS_SECRET!;
  const refreshSecret = process.env.JWT_REFRESH_SECRET!;
  const accessExpiry = process.env.JWT_ACCESS_EXPIRY ?? '15m';
  const refreshExpiry = process.env.JWT_REFRESH_EXPIRY ?? '7d';

  const accessToken = signAccessToken({ userId, email }, accessSecret, accessExpiry);
  const refreshTokenRaw = signRefreshToken({ userId, email }, refreshSecret, refreshExpiry);

  // Persist hashed refresh token
  const tokenHash = hashToken(refreshTokenRaw);
  const expiresAt = new Date(Date.now() + parseDuration(refreshExpiry));
  await createRefreshToken({ userId, tokenHash, expiresAt });

  return { accessToken, refreshToken: refreshTokenRaw };
}

export async function rotateRefreshToken(oldRefreshToken: string) {
  const refreshSecret = process.env.JWT_REFRESH_SECRET!;
  const payload = verifyToken(oldRefreshToken, refreshSecret);

  const oldHash = hashToken(oldRefreshToken);
  const stored = await findRefreshTokenByHash(oldHash);

  if (!stored || stored.isRevoked) {
    // Possible token reuse — revoke entire family
    if (stored) await revokeAllUserTokens(stored.userId);
    throw new Error('Invalid refresh token');
  }

  if (stored.expiresAt < new Date()) {
    await revokeRefreshToken(stored.id);
    throw new Error('Refresh token expired');
  }

  // Revoke old token
  await revokeRefreshToken(stored.id);

  // Issue new pair
  return generateTokenPair(payload.userId, payload.email);
}

export async function revokeTokensForUser(userId: string) {
  await revokeAllUserTokens(userId);
}

function parseDuration(dur: string): number {
  const match = dur.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
  const val = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return val * 1000;
    case 'm': return val * 60 * 1000;
    case 'h': return val * 60 * 60 * 1000;
    case 'd': return val * 24 * 60 * 60 * 1000;
    default:  return 7 * 24 * 60 * 60 * 1000;
  }
}
