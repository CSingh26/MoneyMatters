import { IncomeFrequency } from "../../../shared/types/index";

/**
 * Normalize any income frequency to a monthly equivalent.
 * biweekly: amount × 26 / 12
 * monthly: amount as-is
 */
export function normalizeToMonthly(amount: number, frequency: IncomeFrequency | "annual"): number {
  switch (frequency) {
    case "biweekly":
      return (amount * 26) / 12;
    case "annual":
      return amount / 12;
    case "monthly":
    default:
      return amount;
  }
}
