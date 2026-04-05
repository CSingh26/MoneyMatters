import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/auth';
import { dashboardHandler } from '../controllers/dashboard.controller';

const router = Router();

router.get('/', authenticate, dashboardHandler);

export default router;
