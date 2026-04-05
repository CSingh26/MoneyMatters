import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendError } from '../../../shared/utils/response';
import { findProfileByUserId } from '../models/finance.model';
import { decrypt } from '../../../shared/utils/crypto';

const encKey = () => process.env.ENCRYPTION_KEY!;

export async function listIncomeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await findProfileByUserId(req.user!.userId);
    if (!profile) return sendSuccess(res, []);
    const items = profile.incomeItems.map((i) => ({
      id: i.id,
      name: i.name,
      amount: Number(decrypt(i.amountEnc, encKey())),
      frequency: i.frequency,
      monthlyAmount: Number(i.monthlyAmount),
      createdAt: i.createdAt,
    }));
    sendSuccess(res, items);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function listFixedHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await findProfileByUserId(req.user!.userId);
    if (!profile) return sendSuccess(res, []);
    const items = profile.fixedItems.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      amount: Number(decrypt(i.amountEnc, encKey())),
      frequency: i.frequency,
      monthlyAmount: Number(i.monthlyAmount),
      createdAt: i.createdAt,
    }));
    sendSuccess(res, items);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function listVariableHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await findProfileByUserId(req.user!.userId);
    if (!profile) return sendSuccess(res, []);
    const items = profile.variableItems.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      estimatedMonthly: Number(decrypt(i.estimatedMonthlyEnc, encKey())),
      createdAt: i.createdAt,
    }));
    sendSuccess(res, items);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function listSavingsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await findProfileByUserId(req.user!.userId);
    if (!profile) return sendSuccess(res, []);
    const items = profile.savingsItems.map((i) => ({
      id: i.id,
      type: i.type,
      description: i.description,
      currentBalance: Number(decrypt(i.currentBalanceEnc, encKey())),
      monthlySavings: Number(decrypt(i.monthlySavingsEnc, encKey())),
      createdAt: i.createdAt,
    }));
    sendSuccess(res, items);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function listGoalsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await findProfileByUserId(req.user!.userId);
    if (!profile) return sendSuccess(res, []);
    const items = profile.goals.map((g) => ({
      id: g.id,
      name: g.name,
      target: Number(g.target),
      current: Number(g.current),
      progress: Number(g.target) > 0 ? Math.round((Number(g.current) / Number(g.target)) * 100) : 0,
      status: g.status,
      deadline: g.deadline,
      createdAt: g.createdAt,
    }));
    sendSuccess(res, items);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
