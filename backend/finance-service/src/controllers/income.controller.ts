import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { incomeSchema } from "../utils/validation";
import { formatZodErrors } from "../utils/errors";
import { normalizeToMonthly } from "../utils/normalize";
import { getIncomeByUserId, upsertIncome } from "../models/income.model";
import { IncomeProfile } from "../../../shared/types/index";

export async function createIncome(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = incomeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: formatZodErrors(parsed.error) });
      return;
    }

    const { frequency, amount, sources } = parsed.data;
    const now = new Date().toISOString();

    // Build breakdown with primary income first
    const breakdown: { name: string; monthly: number }[] = [
      { name: "Primary Income", monthly: Math.round(normalizeToMonthly(amount, frequency) * 100) / 100 },
    ];

    if (sources) {
      for (const source of sources) {
        breakdown.push({
          name: source.name,
          monthly: Math.round(normalizeToMonthly(source.amount, source.frequency) * 100) / 100,
        });
      }
    }

    const totalMonthlyIncome = Math.round(breakdown.reduce((sum, item) => sum + item.monthly, 0) * 100) / 100;

    const profile: IncomeProfile = {
      id: uuidv4(),
      userId,
      frequency,
      amount,
      sources: sources || [],
      totalMonthlyIncome,
      breakdown,
      createdAt: now,
      updatedAt: now,
    };

    upsertIncome(profile);

    res.status(201).json({ totalMonthlyIncome, breakdown });
  } catch (error) {
    console.error("Create income error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getIncome(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const profile = getIncomeByUserId(userId);
    if (!profile) {
      res.status(404).json({ error: "No income profile found. Create one first." });
      return;
    }

    res.status(200).json({
      totalMonthlyIncome: profile.totalMonthlyIncome,
      breakdown: profile.breakdown,
      frequency: profile.frequency,
      amount: profile.amount,
      sources: profile.sources,
    });
  } catch (error) {
    console.error("Get income error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}
