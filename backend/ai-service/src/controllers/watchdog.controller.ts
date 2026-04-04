import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { watchdogRequestSchema } from '../validators/ai.validator';
import { analyzeFinances } from '../agents/watchdog.agent';

export async function watchdogHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = watchdogRequestSchema.parse(req.body);
    const analysis = await analyzeFinances(body.financialData);
    sendSuccess(res, analysis, 200, 'Financial analysis complete');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
