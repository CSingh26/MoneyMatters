import { Request, Response } from "express";
import { getIncomeByUserId } from "../models/income.model";
import { getExpenditureByUserId } from "../models/expenditure.model";
import { getSavingsByUserId } from "../models/savings.model";
import {
  FinancialSummary,
  SavingsRateStatus,
  EmergencyFundStatus,
} from "../../../shared/types/index";

export async function getFinancialSummary(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const income = getIncomeByUserId(userId);
    const expenditure = getExpenditureByUserId(userId);
    const savingsEntries = getSavingsByUserId(userId);

    const totalMonthlyIncome = income?.totalMonthlyIncome || 0;
    const totalFixed = expenditure?.totalFixed || 0;
    const totalVariable = expenditure?.totalVariable || 0;
    const totalMonthlyExpenditure = totalFixed + totalVariable;

    const totalMonthlySavings = Math.round(
      savingsEntries.reduce((sum, e) => sum + e.monthlySavingsAmount, 0) * 100
    ) / 100;

    const currentSavingsBalance = Math.round(
      savingsEntries.reduce((sum, e) => sum + e.currentBalance, 0) * 100
    ) / 100;

    const disposableIncome = Math.round(
      (totalMonthlyIncome - totalMonthlyExpenditure - totalMonthlySavings) * 100
    ) / 100;

    const savingsRate = totalMonthlyIncome > 0
      ? Math.round((totalMonthlySavings / totalMonthlyIncome) * 10000) / 100
      : 0;

    const expenseRatio = totalMonthlyIncome > 0
      ? Math.round((totalMonthlyExpenditure / totalMonthlyIncome) * 10000) / 100
      : 0;

    const runway = totalMonthlyExpenditure > 0
      ? Math.round((currentSavingsBalance / totalMonthlyExpenditure) * 100) / 100
      : 0;

    // Housing costs: mortgage + rent
    const housingCategories = new Set(["mortgage", "rent"]);
    const housingCosts = expenditure
      ? Math.round(
          expenditure.fixedExpenses
            .filter((e) => housingCategories.has(e.category))
            .reduce((sum, e) => sum + e.monthlyAmount, 0) * 100
        ) / 100
      : 0;

    // Debt payments: loans
    const debtCategories = new Set(["car_loan", "student_loan", "personal_loan"]);
    const debtPayments = expenditure
      ? Math.round(
          expenditure.fixedExpenses
            .filter((e) => debtCategories.has(e.category))
            .reduce((sum, e) => sum + e.monthlyAmount, 0) * 100
        ) / 100
      : 0;

    // Living expenses: all variable
    const livingExpenses = totalVariable;

    // Health indicators
    let savingsRateStatus: SavingsRateStatus;
    if (savingsRate >= 20) savingsRateStatus = "healthy";
    else if (savingsRate >= 5) savingsRateStatus = "low";
    else savingsRateStatus = "critical";

    const debtToIncomeRatio = totalMonthlyIncome > 0
      ? Math.round((debtPayments / totalMonthlyIncome) * 10000) / 100
      : 0;

    const emergencyFundMonths = runway;

    let emergencyFundStatus: EmergencyFundStatus;
    if (emergencyFundMonths > 6) emergencyFundStatus = "strong";
    else if (emergencyFundMonths >= 3) emergencyFundStatus = "adequate";
    else emergencyFundStatus = "insufficient";

    const summary: FinancialSummary = {
      totalMonthlyIncome,
      totalMonthlyExpenditure,
      totalMonthlySavings,
      disposableIncome,
      savingsRate,
      expenseRatio,
      runway,
      breakdown: {
        housingCosts,
        debtPayments,
        livingExpenses,
        savings: totalMonthlySavings,
      },
      healthIndicators: {
        savingsRateStatus,
        debtToIncomeRatio,
        emergencyFundMonths,
        emergencyFundStatus,
      },
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error("Financial summary error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}
