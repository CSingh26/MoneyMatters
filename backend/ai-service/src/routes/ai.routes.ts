import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/auth';
import { serviceAuth } from '../../../shared/middleware/serviceAuth';
import { parseHandler, parseStatusHandler } from '../controllers/parse.controller';
import { watchdogHandler } from '../controllers/watchdog.controller';
import { scenarioHandler, scenariosListHandler, scenarioByIdHandler } from '../controllers/scenario.controller';

const router = Router();

// Internal service-to-service routes (policy-service calls these)
router.post('/parse', serviceAuth, parseHandler);
router.get('/parse/status/:policyId', serviceAuth, parseStatusHandler);

// User-facing routes (require JWT)
router.post('/watchdog', authenticate, watchdogHandler);
router.post('/scenario', authenticate, scenarioHandler);
router.get('/scenarios', authenticate, scenariosListHandler);
router.get('/scenario/:id', authenticate, scenarioByIdHandler);

export default router;
