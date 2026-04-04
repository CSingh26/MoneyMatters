import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/auth';
import { createRateLimiter } from '../../../shared/middleware/rateLimiter';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  profileHandler,
  updateProfileHandler,
  logoutHandler,
  deleteAccountHandler,
} from '../controllers/auth.controller';

const router = Router();
const authLimiter = createRateLimiter({ max: 20, windowMs: 15 * 60 * 1000 });

// Public routes
router.post('/register', authLimiter, registerHandler);
router.post('/login', authLimiter, loginHandler);
router.post('/refresh', authLimiter, refreshHandler);

// Protected routes
router.get('/profile', authenticate, profileHandler);
router.patch('/profile', authenticate, updateProfileHandler);
router.post('/logout', authenticate, logoutHandler);
router.delete('/account', authenticate, deleteAccountHandler);

export default router;
