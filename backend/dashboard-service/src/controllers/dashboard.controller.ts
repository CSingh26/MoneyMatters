import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendError } from '../../../shared/utils/response';
import { aggregateDashboard } from '../services/aggregator.service';

export async function dashboardHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const accessToken = req.headers.authorization?.slice(7) ?? '';
    const data = await aggregateDashboard(req.user!.userId, accessToken);
    sendSuccess(res, data, 200, 'Dashboard data aggregated');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
