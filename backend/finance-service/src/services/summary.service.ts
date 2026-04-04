import { decrypt } from '../../../shared/utils/crypto';
import { findProfileByUserId, updateHealthScore } from '../models/finance.model';

const encKey = () => process.env.ENCRYPTION_KEY!;

export interface FinanceSummary {
  totalMonthlyIncome: number;
  totalMonthlyFixed: number;
  totalMonthlyVariable: number;
  totalMonthlyExpenses: number;
  totalMonthlySavings: number;
  totalSavingsBalance: number;
  netMonthlyCashflow: number;
  savingsRate: number;
  healthScore: number;
  goals: {
    id: string; name: string; target: number;
    current: number; progress: number; status: string;
    deadline: Date | null;
  }[];
}

export async function getSummary(userId: string): Promise<FinanceSummary> {
  const profile = await findProfileByUserId(userId);
  if (!profile) throw Object.assign(new Error('Finance profile not found'), { status: 404 });

  const totalMonthlyIncome = profile.incomeItems.reduce(
    (sum, i) => sum + Number(i.monthlyAmount), 0);

  const totalMonthlyFixed = profile.fixedItems.reduce(
    (sum, i) => sum + Number(i.monthlyAmount), 0);

  const totalMonthlyVariable = profile.variableItems.reduce(
    (sum, i) => sum + Number(i.estimatedMonthly), 0);

  const totalMonthlyExpenses = totalMonthlyFixed + totalMonthlyVariable;

  const totalMonthlySavings = profile.savingsItems.reduce(
    (sum, i) => sum + Number(i.monthlySavings), 0);

  const totalSavingsBalance = profile.savingsItems.reduce(
    (sum, i) => sum + Number(i.currentBalance), 0);

  const netMonthlyCashflow = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlySavings;

  const savingsRate = totalMonthlyIncome > 0
    ? Math.round((totalMonthlySavings / totalMonthlyIncome) * 100)
    : 0;

  const healthScore = calculateHealthScore(
    totalMonthlyIncome, totalMonthlyExpenses, totalMonthlySavings, totalSavingsBalance,
  );

  // Persist health score
  await updateHealthScore(profile.id, healthScore);

  const goals = profile.goals.map((g) => ({
    id: g.id,
    name: g.name,
    target: Number(g.target),
    current: Number(g.current),
    progress: Number(g.target) > 0 ? Math.round((Number(g.current) / Number(g.target)) * 100) : 0,
    status: g.status,
    deadline: g.deadline,
  }));

  return {
    totalMonthlyIncome,
    totalMonthlyFixed,
    totalMonthlyVariable,
    totalMonthlyExpenses,
    totalMonthlySavings,
    totalSavingsBalance,
    netMonthlyCashflow,
    savingsRate,
    healthScore,
    goals,
  };
}

function calculateHealthScore(
  income: number, expenses: number, savings: number, balance: number,
): number {
  if (income === 0) return 0;

  let score = 0;
  const expenseRatio = expenses / income;
  const savingsRatio = savings / income;
  const emergencyMonths = income > 0 ? balance / income : 0;

  // Expense ratio (40 pts): <=50% = 40, <=70% = 25, <=90% = 10
  if (expenseRatio <= 0.5) score += 40;
  else if (expenseRatio <= 0.7) score += 25;
  else if (expenseRatio <= 0.9) score += 10;

  // Savings rate (35 pts): >=20% = 35, >=10% = 20, >0% = 10
  if (savingsRatio >= 0.2) score += 35;
  else if (savingsRatio >= 0.1) score += 20;
  else if (savingsRatio > 0) score += 10;

  // Emergency fund (25 pts): >=6mo = 25, >=3mo = 15, >=1mo = 5
  if (emergencyMonths >= 6) score += 25;
  else if (emergencyMonths >= 3) score += 15;
  else if (emergencyMonths >= 1) score += 5;

  return Math.min(score, 100);
}
