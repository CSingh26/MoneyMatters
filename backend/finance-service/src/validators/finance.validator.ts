import { z } from 'zod';

/* ── Income ── */
export const createIncomeSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['monthly', 'biweekly']),
});

export const updateIncomeSchema = createIncomeSchema.partial();

/* ── Fixed Expenditure ── */
export const createFixedExpenditureSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum([
    'mortgage', 'rent', 'car_loan', 'student_loan', 'personal_loan',
    'utilities', 'insurance', 'subscriptions', 'other',
  ]),
  amount: z.number().positive(),
  frequency: z.enum(['monthly', 'biweekly', 'annual']),
});

export const updateFixedExpenditureSchema = createFixedExpenditureSchema.partial();

/* ── Variable Expenditure ── */
export const createVariableExpenditureSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum([
    'gas', 'food_groceries', 'dining_out', 'shopping',
    'entertainment', 'healthcare', 'transport', 'misc',
  ]),
  estimatedMonthly: z.number().positive(),
});

export const updateVariableExpenditureSchema = createVariableExpenditureSchema.partial();

/* ── Savings ── */
export const createSavingsSchema = z.object({
  type: z.enum([
    'liquid_savings', 'stocks', 'index_funds', 'retirement_401k',
    'ira', 'locked_cd', 'crypto', 'other',
  ]),
  description: z.string().max(200).optional(),
  currentBalance: z.number().min(0),
  monthlySavings: z.number().min(0),
});

export const updateSavingsSchema = createSavingsSchema.partial();

/* ── Goals ── */
export const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  target: z.number().positive(),
  current: z.number().min(0).default(0),
  deadline: z.string().datetime().optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  target: z.number().positive().optional(),
  current: z.number().min(0).optional(),
  deadline: z.string().datetime().optional().nullable(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
});
