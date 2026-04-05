import { z } from 'zod';

export const uploadPolicySchema = z.object({
  type: z.enum(['auto', 'home', 'renters', 'health', 'life']),
  renewalDate: z.string().datetime().optional(),
});

export const listPoliciesSchema = z.object({
  type: z.enum(['auto', 'home', 'renters', 'health', 'life']).optional(),
  parseStatus: z.enum(['pending', 'processing', 'done', 'failed']).optional(),
});

export type UploadPolicyInput = z.infer<typeof uploadPolicySchema>;
export type ListPoliciesInput = z.infer<typeof listPoliciesSchema>;
