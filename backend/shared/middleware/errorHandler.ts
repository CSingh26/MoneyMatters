import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

/**
 * Global Express error handler.
 * Catches Zod validation errors, known AppErrors, and unexpected errors.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join('; ');
    sendError(res, message, 400);
    return;
  }

  logger.error(err.message, { stack: err.stack });
  sendError(res, 'Internal server error', 500);
}
