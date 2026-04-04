import { Request, Response } from "express";
import { fixedExpenditureSchema, variableExpenditureSchema } from "../utils/validation";
import { formatZodErrors } from "../utils/errors";
import { normalizeToMonthly } from "../utils/normalize";
import {
  getExpenditureByUserId,
  upsertFixedExpenses,
  upsertVariableExpenses,
} from "../models/expenditure.model";
import { FixedExpenseItem, VariableExpenseItem } from "../../../shared/types/index";

export async function createFixedExpenditure(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = fixedExpenditureSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: formatZodErrors(parsed.error) });
      return;
    }

    const normalizedItems = parsed.data.items.map((item) => ({
      ...item,
      monthlyAmount: Math.round(normalizeToMonthly(item.amount, item.frequency) * 100) / 100,
    }));

    const totalFixed = Math.round(
      normalizedItems.reduce((sum, item) => sum + item.monthlyAmount, 0) * 100
    ) / 100;

    const profile = upsertFixedExpenses(userId, normalizedItems, totalFixed);

    // Build category breakdown
    const categoryBreakdown: Record<string, number> = {};
    for (const item of normalizedItems) {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.monthlyAmount;
    }

    res.status(201).json({
      totalFixed: profile.totalFixed,
      items: normalizedItems,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Fixed expenditure error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createVariableExpenditure(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = variableExpenditureSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: formatZodErrors(parsed.error) });
      return;
    }

    const totalVariable = Math.round(
      parsed.data.items.reduce((sum, item) => sum + item.estimatedMonthly, 0) * 100
    ) / 100;

    const profile = upsertVariableExpenses(userId, parsed.data.items, totalVariable);

    // Build category breakdown
    const categoryBreakdown: Record<string, number> = {};
    for (const item of parsed.data.items) {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.estimatedMonthly;
    }

    res.status(201).json({
      totalVariable: profile.totalVariable,
      items: parsed.data.items,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Variable expenditure error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getExpenditure(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const profile = getExpenditureByUserId(userId);
    if (!profile) {
      res.status(404).json({ error: "No expenditure data found. Create fixed or variable expenses first." });
      return;
    }

    // Build combined category breakdown
    const categoryBreakdown: Record<string, number> = {};
    for (const item of profile.fixedExpenses) {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.monthlyAmount;
    }
    for (const item of profile.variableExpenses) {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.estimatedMonthly;
    }

    res.status(200).json({
      totalFixed: profile.totalFixed,
      totalVariable: profile.totalVariable,
      totalExpenditure: profile.totalExpenditure,
      categoryBreakdown,
      fixedExpenses: profile.fixedExpenses,
      variableExpenses: profile.variableExpenses,
    });
  } catch (error) {
    console.error("Get expenditure error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}
