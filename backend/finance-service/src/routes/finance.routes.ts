import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/auth';
import * as income from '../controllers/income.controller';
import * as expenditure from '../controllers/expenditure.controller';
import * as savings from '../controllers/savings.controller';
import * as goals from '../controllers/goals.controller';
import { summaryHandler } from '../controllers/summary.controller';
import {
  listIncomeHandler, listFixedHandler, listVariableHandler,
  listSavingsHandler, listGoalsHandler,
} from '../controllers/list.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/* ── Income ── */
router.get('/income', listIncomeHandler);
router.post('/income', income.addHandler);
router.patch('/income/:id', income.editHandler);
router.delete('/income/:id', income.removeHandler);

/* ── Fixed Expenditure ── */
router.get('/expenditure/fixed', listFixedHandler);
router.post('/expenditure/fixed', expenditure.addFixedHandler);
router.patch('/expenditure/fixed/:id', expenditure.editFixedHandler);
router.delete('/expenditure/fixed/:id', expenditure.removeFixedHandler);

/* ── Variable Expenditure ── */
router.get('/expenditure/variable', listVariableHandler);
router.post('/expenditure/variable', expenditure.addVariableHandler);
router.patch('/expenditure/variable/:id', expenditure.editVariableHandler);
router.delete('/expenditure/variable/:id', expenditure.removeVariableHandler);

/* ── Savings ── */
router.get('/savings', listSavingsHandler);
router.post('/savings', savings.addHandler);
router.patch('/savings/:id', savings.editHandler);
router.delete('/savings/:id', savings.removeHandler);

/* ── Goals ── */
router.get('/goals', listGoalsHandler);
router.post('/goals', goals.addHandler);
router.patch('/goals/:id', goals.editHandler);
router.delete('/goals/:id', goals.removeHandler);

/* ── Summary ── */
router.get('/summary', summaryHandler);

export default router;
