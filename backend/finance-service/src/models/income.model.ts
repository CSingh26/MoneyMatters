import { IncomeProfile } from "../../../shared/types/index";

// In-memory store — swap for Prisma/PostgreSQL later
const incomeProfiles = new Map<string, IncomeProfile>(); // userId → IncomeProfile

export function getIncomeByUserId(userId: string): IncomeProfile | undefined {
  return incomeProfiles.get(userId);
}

export function upsertIncome(profile: IncomeProfile): IncomeProfile {
  incomeProfiles.set(profile.userId, profile);
  return profile;
}
