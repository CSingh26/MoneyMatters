import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendError } from '../../../shared/utils/response';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
} from '../validators/auth.validator';
import * as authService from '../services/auth.service';

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { confirmPassword, ...body } = registerSchema.parse(req.body);
    const result = await authService.register(body);
    sendSuccess(res, result, 201, 'Registration successful');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body);
    sendSuccess(res, result, 200, 'Login successful');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = refreshSchema.parse(req.body);
    const tokens = await authService.refresh(body.refreshToken);
    sendSuccess(res, tokens, 200, 'Tokens refreshed');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    sendError(res, 'Invalid refresh token', 401);
  }
}

export async function profileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function updateProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(req.user!.userId, body);
    sendSuccess(res, user, 200, 'Profile updated');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function logoutHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.user!.userId);
    sendSuccess(res, null, 200, 'Logged out');
  } catch (err: any) {
    next(err);
  }
}

export async function deleteAccountHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await authService.deleteAccount(req.user!.userId);
    sendSuccess(res, null, 200, 'Account deactivated');
  } catch (err: any) {
    next(err);
  }
}
