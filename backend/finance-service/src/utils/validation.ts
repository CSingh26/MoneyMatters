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

// ─── Expenditure Schemas ────────────────────────────────────

const expenseFrequency = z.enum(["monthly", "biweekly", "annual"]);

const fixedExpenseCategory = z.enum([
  "mortgage", "rent", "car_loan", "student_loan", "personal_loan",
  "utilities", "insurance", "subscriptions", "other",
]);

const variableExpenseCategory = z.enum([
  "gas", "food_groceries", "dining_out", "shopping",
  "entertainment", "healthcare", "transport", "misc",
]);

export const fixedExpenditureSchema = z.object({
  items: z.array(
    z.object({
      category: fixedExpenseCategory,
      name: z.string().min(1, "Expense name is required"),
      amount: positiveNumber,
      frequency: expenseFrequency,
    })
  ).min(1, "At least one fixed expense item is required"),
});

export const variableExpenditureSchema = z.object({
  items: z.array(
    z.object({
      category: variableExpenseCategory,
      name: z.string().min(1, "Expense name is required"),
      estimatedMonthly: positiveNumber,
    })
  ).min(1, "At least one variable expense item is required"),
});

export type FixedExpenditureInput = z.infer<typeof fixedExpenditureSchema>;
export type VariableExpenditureInput = z.infer<typeof variableExpenditureSchema>;
