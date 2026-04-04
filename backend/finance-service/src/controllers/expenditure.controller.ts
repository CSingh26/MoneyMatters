import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendError } from '../../../shared/utils/response';
import {
  createFixedExpenditureSchema, updateFixedExpenditureSchema,
  createVariableExpenditureSchema, updateVariableExpenditureSchema,
} from '../validators/finance.validator';
import * as expenditureService from '../services/expenditure.service';

/* ── Fixed ── */
export async function addFixedHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = createFixedExpenditureSchema.parse(req.body);
    const item = await expenditureService.addFixed(req.user!.userId, body);
    sendSuccess(res, item, 201, 'Fixed expenditure added');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function editFixedHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = updateFixedExpenditureSchema.parse(req.body);
    const item = await expenditureService.editFixed(req.params.id as string, req.user!.userId, body);
    sendSuccess(res, item, 200, 'Fixed expenditure updated');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function removeFixedHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await expenditureService.removeFixed(req.params.id as string, req.user!.userId);
    sendSuccess(res, null, 200, 'Fixed expenditure deleted');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

/* ── Variable ── */
export async function addVariableHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = createVariableExpenditureSchema.parse(req.body);
    const item = await expenditureService.addVariable(req.user!.userId, body);
    sendSuccess(res, item, 201, 'Variable expenditure added');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function editVariableHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = updateVariableExpenditureSchema.parse(req.body);
    const item = await expenditureService.editVariable(req.params.id as string, req.user!.userId, body);
    sendSuccess(res, item, 200, 'Variable expenditure updated');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function removeVariableHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await expenditureService.removeVariable(req.params.id as string, req.user!.userId);
    sendSuccess(res, null, 200, 'Variable expenditure deleted');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
