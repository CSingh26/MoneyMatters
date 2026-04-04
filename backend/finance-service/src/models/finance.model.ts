import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/* ── Profile ── */

export async function findOrCreateProfile(userId: string) {
  return prisma.financeProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: {
      incomeItems: true,
      fixedItems: true,
      variableItems: true,
      savingsItems: true,
      goals: true,
    },
  });
}

export async function findProfileByUserId(userId: string) {
  return prisma.financeProfile.findUnique({
    where: { userId },
    include: {
      incomeItems: true,
      fixedItems: true,
      variableItems: true,
      savingsItems: true,
      goals: true,
    },
  });
}

export async function updateHealthScore(profileId: string, healthScore: number) {
  return prisma.financeProfile.update({ where: { id: profileId }, data: { healthScore } });
}

/* ── Income ── */

export async function createIncome(profileId: string, data: {
  name: string; amountEnc: string; frequency: any; monthlyAmount: number;
}) {
  return prisma.financeIncomeItem.create({ data: { profileId, ...data } });
}

export async function updateIncome(id: string, data: Record<string, any>) {
  return prisma.financeIncomeItem.update({ where: { id }, data });
}

export async function deleteIncome(id: string) {
  return prisma.financeIncomeItem.delete({ where: { id } });
}

export async function findIncomeById(id: string) {
  return prisma.financeIncomeItem.findUnique({ where: { id } });
}

/* ── Fixed Expenditure ── */

export async function createFixed(profileId: string, data: {
  name: string; category: any; amountEnc: string; frequency: any; monthlyAmount: number;
}) {
  return prisma.financeFixedExpenditure.create({ data: { profileId, ...data } });
}

export async function updateFixed(id: string, data: Record<string, any>) {
  return prisma.financeFixedExpenditure.update({ where: { id }, data });
}

export async function deleteFixed(id: string) {
  return prisma.financeFixedExpenditure.delete({ where: { id } });
}

export async function findFixedById(id: string) {
  return prisma.financeFixedExpenditure.findUnique({ where: { id } });
}

/* ── Variable Expenditure ── */

export async function createVariable(profileId: string, data: {
  name: string; category: any; estimatedMonthlyEnc: string; estimatedMonthly: number;
}) {
  return prisma.financeVariableExpenditure.create({ data: { profileId, ...data } });
}

export async function updateVariable(id: string, data: Record<string, any>) {
  return prisma.financeVariableExpenditure.update({ where: { id }, data });
}

export async function deleteVariable(id: string) {
  return prisma.financeVariableExpenditure.delete({ where: { id } });
}

export async function findVariableById(id: string) {
  return prisma.financeVariableExpenditure.findUnique({ where: { id } });
}

/* ── Savings ── */

export async function createSavings(profileId: string, data: {
  type: any; description?: string; currentBalanceEnc: string; currentBalance: number;
  monthlySavingsEnc: string; monthlySavings: number;
}) {
  return prisma.financeSavingsItem.create({ data: { profileId, ...data } });
}

export async function updateSavings(id: string, data: Record<string, any>) {
  return prisma.financeSavingsItem.update({ where: { id }, data });
}

export async function deleteSavings(id: string) {
  return prisma.financeSavingsItem.delete({ where: { id } });
}

export async function findSavingsById(id: string) {
  return prisma.financeSavingsItem.findUnique({ where: { id } });
}

/* ── Goals ── */

export async function createGoal(profileId: string, data: {
  name: string; targetEnc: string; target: number;
  currentEnc: string; current: number; deadline?: Date | null;
}) {
  return prisma.financeGoal.create({ data: { profileId, ...data } });
}

export async function updateGoal(id: string, data: Record<string, any>) {
  return prisma.financeGoal.update({ where: { id }, data });
}

export async function deleteGoal(id: string) {
  return prisma.financeGoal.delete({ where: { id } });
}

export async function findGoalById(id: string) {
  return prisma.financeGoal.findUnique({ where: { id } });
}

export { prisma };
