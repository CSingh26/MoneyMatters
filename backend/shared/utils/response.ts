import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string,
  meta?: Record<string, unknown>,
): void {
  const body: ApiResponse<T> = { success: true, data };
  if (message) body.message = message;
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  error: string,
  statusCode: number = 500,
): void {
  const body: ApiResponse = { success: false, error };
  res.status(statusCode).json(body);
}
