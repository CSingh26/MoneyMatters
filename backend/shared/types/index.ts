// Shared TypeScript interfaces for PolicyLens AI microservices

// ─── User & Auth ────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: Gender;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";

export interface UserPublic {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: Gender;
  email: string;
  createdAt: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  type?: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Income ─────────────────────────────────────────────────

export type IncomeFrequency = "monthly" | "biweekly";

export interface IncomeSource {
  name: string;
  amount: number;
  frequency: IncomeFrequency;
}

export interface IncomeProfile {
  id: string;
  userId: string;
  frequency: IncomeFrequency;
  amount: number;
  sources: IncomeSource[];
  totalMonthlyIncome: number;
  breakdown: { name: string; monthly: number }[];
  createdAt: string;
  updatedAt: string;
}

// ─── Expenditure ────────────────────────────────────────────

export type FixedExpenseCategory =
  | "mortgage"
  | "rent"
  | "car_loan"
  | "student_loan"
  | "personal_loan"
  | "utilities"
  | "insurance"
  | "subscriptions"
  | "other";

export type VariableExpenseCategory =
  | "gas"
  | "food_groceries"
  | "dining_out"
  | "shopping"
  | "entertainment"
  | "healthcare"
  | "transport"
  | "misc";

export type ExpenseFrequency = "monthly" | "biweekly" | "annual";

export interface FixedExpenseItem {
  category: FixedExpenseCategory;
  name: string;
  amount: number;
  frequency: ExpenseFrequency;
}

export interface VariableExpenseItem {
  category: VariableExpenseCategory;
  name: string;
  estimatedMonthly: number;
}

export interface ExpenditureProfile {
  id: string;
  userId: string;
  fixedExpenses: (FixedExpenseItem & { monthlyAmount: number })[];
  variableExpenses: VariableExpenseItem[];
  totalFixed: number;
  totalVariable: number;
  totalExpenditure: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Savings ────────────────────────────────────────────────

export type SavingsType =
  | "liquid_savings"
  | "stocks"
  | "index_funds"
  | "retirement_401k"
  | "ira"
  | "locked_cd"
  | "crypto"
  | "other";

export interface SavingsEntry {
  id: string;
  userId: string;
  currentBalance: number;
  type: SavingsType;
  monthlySavingsAmount: number;
  description?: string;
  createdAt: string;
}

// ─── Financial Summary ──────────────────────────────────────

export type SavingsRateStatus = "healthy" | "low" | "critical";
export type EmergencyFundStatus = "strong" | "adequate" | "insufficient";

export interface HealthIndicators {
  savingsRateStatus: SavingsRateStatus;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  emergencyFundStatus: EmergencyFundStatus;
}

export interface FinancialSummary {
  totalMonthlyIncome: number;
  totalMonthlyExpenditure: number;
  totalMonthlySavings: number;
  disposableIncome: number;
  savingsRate: number;
  expenseRatio: number;
  runway: number;
  breakdown: {
    housingCosts: number;
    debtPayments: number;
    livingExpenses: number;
    savings: number;
  };
  healthIndicators: HealthIndicators;
}

// ─── API Responses ──────────────────────────────────────────

export interface ApiError {
  error: string;
}

export interface ValidationError {
  errors: { field: string; message: string }[];
}
