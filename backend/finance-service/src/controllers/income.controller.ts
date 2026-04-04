import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendError } from '../../../shared/utils/response';
import { createIncomeSchema, updateIncomeSchema } from '../validators/finance.validator';
import * as incomeService from '../services/income.service';

export async function addHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = createIncomeSchema.parse(req.body);
    const item = await incomeService.addIncome(req.user!.userId, body);
    sendSuccess(res, item, 201, 'Income item added');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function editHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = updateIncomeSchema.parse(req.body);
    const item = await incomeService.editIncome(req.params.id as string, req.user!.userId, body);
    sendSuccess(res, item, 200, 'Income item updated');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function removeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await incomeService.removeIncome(req.params.id as string, req.user!.userId);
    sendSuccess(res, null, 200, 'Income item deleted');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
