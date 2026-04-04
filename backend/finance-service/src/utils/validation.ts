import { z } from "zod";

const incomeFrequency = z.enum(["monthly", "biweekly"]);

const positiveNumber = z.number().positive("Amount must be positive").finite("Amount must be a finite number");

export const incomeSchema = z.object({
  frequency: incomeFrequency,
  amount: positiveNumber,
  sources: z
    .array(
      z.object({
        name: z.string().min(1, "Source name is required"),
        amount: positiveNumber,
        frequency: incomeFrequency,
      })
    )
    .optional(),
});

export type IncomeInput = z.infer<typeof incomeSchema>;
