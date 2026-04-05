import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendError } from '../../../shared/utils/response';
import { createGoalSchema, updateGoalSchema } from '../validators/finance.validator';
import { findOrCreateProfile, createGoal, updateGoal, deleteGoal, findGoalById } from '../models/finance.model';
import { encrypt } from '../../../shared/utils/crypto';

const encKey = () => process.env.ENCRYPTION_KEY!;

export async function addHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = createGoalSchema.parse(req.body);
    const profile = await findOrCreateProfile(req.user!.userId);
    const goal = await createGoal(profile.id, {
      name: body.name,
      targetEnc: encrypt(body.target.toString(), encKey()),
      target: body.target,
      currentEnc: encrypt(body.current.toString(), encKey()),
      current: body.current,
      deadline: body.deadline ? new Date(body.deadline) : null,
    });
    sendSuccess(res, goal, 201, 'Goal created');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function editHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = updateGoalSchema.parse(req.body);
    const goal = await findGoalById(req.params.id as string);
    if (!goal) return sendError(res, 'Goal not found', 404);

    const profile = await findOrCreateProfile(req.user!.userId);
    if (goal.profileId !== profile.id) return sendError(res, 'Forbidden', 403);

    const data: Record<string, any> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.status !== undefined) data.status = body.status;
    if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null;
    if (body.target !== undefined) {
      data.targetEnc = encrypt(body.target.toString(), encKey());
      data.target = body.target;
    }
    if (body.current !== undefined) {
      data.currentEnc = encrypt(body.current.toString(), encKey());
      data.current = body.current;
    }

    const updated = await updateGoal(req.params.id as string, data);
    sendSuccess(res, updated, 200, 'Goal updated');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function removeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const goal = await findGoalById(req.params.id as string);
    if (!goal) return sendError(res, 'Goal not found', 404);

    const profile = await findOrCreateProfile(req.user!.userId);
    if (goal.profileId !== profile.id) return sendError(res, 'Forbidden', 403);

    await deleteGoal(req.params.id as string);
    sendSuccess(res, null, 200, 'Goal deleted');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}
