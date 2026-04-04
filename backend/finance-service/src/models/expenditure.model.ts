import { ExpenditureProfile, FixedExpenseItem, VariableExpenseItem } from "../../../shared/types/index";

// In-memory store — swap for Prisma/PostgreSQL later
const expenditureProfiles = new Map<string, ExpenditureProfile>();

export function getExpenditureByUserId(userId: string): ExpenditureProfile | undefined {
  return expenditureProfiles.get(userId);
}

export function upsertFixedExpenses(
  userId: string,
  fixedExpenses: (FixedExpenseItem & { monthlyAmount: number })[],
  totalFixed: number
): ExpenditureProfile {
  const existing = expenditureProfiles.get(userId);
  const now = new Date().toISOString();

  const profile: ExpenditureProfile = {
    id: existing?.id || userId,
    userId,
    fixedExpenses,
    variableExpenses: existing?.variableExpenses || [],
    totalFixed,
    totalVariable: existing?.totalVariable || 0,
    totalExpenditure: totalFixed + (existing?.totalVariable || 0),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  expenditureProfiles.set(userId, profile);
  return profile;
}

export function upsertVariableExpenses(
  userId: string,
  variableExpenses: VariableExpenseItem[],
  totalVariable: number
): ExpenditureProfile {
  const existing = expenditureProfiles.get(userId);
  const now = new Date().toISOString();

  const profile: ExpenditureProfile = {
    id: existing?.id || userId,
    userId,
    fixedExpenses: existing?.fixedExpenses || [],
    variableExpenses,
    totalFixed: existing?.totalFixed || 0,
    totalVariable,
    totalExpenditure: (existing?.totalFixed || 0) + totalVariable,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  expenditureProfiles.set(userId, profile);
  return profile;
}
