import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { uploadPolicySchema, listPoliciesSchema } from '../validators/policy.validator';
import * as policyService from '../services/policy.service';

export async function uploadHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) return sendError(res, 'PDF file is required', 400);

    const body = uploadPolicySchema.parse(req.body);
    const policy = await policyService.uploadPolicy(
      req.user!.userId,
      req.file,
      body.type,
      body.renewalDate,
    );
    sendSuccess(res, policy, 201, 'Policy uploaded — parsing will begin shortly');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function getHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const policy = await policyService.getPolicy(req.params.id, req.user!.userId);
    sendSuccess(res, policy);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function listHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = listPoliciesSchema.parse(req.query);
    const policies = await policyService.listPolicies(req.user!.userId, query as any);
    sendSuccess(res, policies);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function deleteHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await policyService.removePolicy(req.params.id, req.user!.userId);
    sendSuccess(res, null, 200, 'Policy deleted');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
