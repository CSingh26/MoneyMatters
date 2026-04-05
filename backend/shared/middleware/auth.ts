import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

/**
 * Express middleware that verifies the JWT access token from the
 * Authorization header and attaches the decoded payload to `req.user`.
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Missing or malformed Authorization header', 401);
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    sendError(res, 'Server misconfiguration: missing JWT secret', 500);
    return;
  }

  try {
    const payload = verifyToken(token, secret);
    req.user = payload;
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}
