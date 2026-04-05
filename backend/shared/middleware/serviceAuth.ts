import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { ServiceRequest } from '../types';

/**
 * Middleware that validates the X-Internal-Service-Key header
 * for service-to-service calls using timing-safe comparison.
 */
export function serviceAuth(
  req: ServiceRequest,
  res: Response,
  next: NextFunction,
): void {
  const expected = process.env.INTERNAL_SERVICE_KEY;

  if (!expected) {
    sendError(res, 'Server misconfiguration: missing internal service key', 500);
    return;
  }

  const provided = req.headers['x-internal-service-key'] as string | undefined;

  if (!provided) {
    sendError(res, 'Missing X-Internal-Service-Key header', 401);
    return;
  }

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);

  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    sendError(res, 'Invalid service key', 403);
    return;
  }

  req.isInternalService = true;
  next();
}
