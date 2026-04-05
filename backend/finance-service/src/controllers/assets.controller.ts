import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendError } from '../../../shared/utils/response';
import { createAssetSchema, updateAssetSchema } from '../validators/finance.validator';
import * as assetsService from '../services/assets.service';

export async function addHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = createAssetSchema.parse(req.body);
    const item = await assetsService.addAsset(req.user!.userId, body);
    sendSuccess(res, item, 201, 'Asset added');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function editHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = updateAssetSchema.parse(req.body);
    const item = await assetsService.editAsset(req.params.id as string, req.user!.userId, body);
    sendSuccess(res, item, 200, 'Asset updated');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function removeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await assetsService.removeAsset(req.params.id as string, req.user!.userId);
    sendSuccess(res, null, 200, 'Asset deleted');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
