import { z } from 'zod';

export const parseRequestSchema = z.object({
  policyId: z.string().uuid(),
  pdfText: z.string().min(1, 'PDF text is required'),
  userId: z.string().uuid(),
  policyType: z.enum(['auto', 'home', 'renters', 'health', 'life']).optional(),
});

export const watchdogRequestSchema = z.object({
  userId: z.string().uuid(),
  financialData: z.record(z.unknown()),
});

export const scenarioRequestSchema = z.object({
  query: z.string().min(1).max(500),
  scenarioType: z.enum(['income_shock', 'medical', 'policy_change', 'property']).default('income_shock'),
  financialData: z.record(z.unknown()).default({}),
  policyData: z.record(z.unknown()).optional(),
});

export type ParseRequest = z.infer<typeof parseRequestSchema>;
export type WatchdogRequest = z.infer<typeof watchdogRequestSchema>;
export type ScenarioRequest = z.infer<typeof scenarioRequestSchema>;
