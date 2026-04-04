import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendError } from '../../../shared/utils/response';
import { createSavingsSchema, updateSavingsSchema } from '../validators/finance.validator';
import * as savingsService from '../services/savings.service';

export async function addHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = createSavingsSchema.parse(req.body);
    const item = await savingsService.addSavings(req.user!.userId, body);
    sendSuccess(res, item, 201, 'Savings item added');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function editHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = updateSavingsSchema.parse(req.body);
    const item = await savingsService.editSavings(req.params.id as string, req.user!.userId, body);
    sendSuccess(res, item, 200, 'Savings item updated');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function removeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await savingsService.removeSavings(req.params.id as string, req.user!.userId);
    sendSuccess(res, null, 200, 'Savings item deleted');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
