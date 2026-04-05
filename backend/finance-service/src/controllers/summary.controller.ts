import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendError } from '../../../shared/utils/response';
import * as summaryService from '../services/summary.service';

export async function summaryHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const summary = await summaryService.getSummary(req.user!.userId);
    sendSuccess(res, summary);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
