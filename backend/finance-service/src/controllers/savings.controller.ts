import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { savingsSchema } from "../utils/validation";
import { formatZodErrors } from "../utils/errors";
import { addSavingsEntry, getSavingsByUserId } from "../models/savings.model";
import { SavingsEntry } from "../../../shared/types/index";

export async function createSavings(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = savingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: formatZodErrors(parsed.error) });
      return;
    }

    const entry: SavingsEntry = {
      id: uuidv4(),
      userId,
      currentBalance: parsed.data.currentBalance,
      type: parsed.data.type,
      monthlySavingsAmount: parsed.data.monthlySavingsAmount,
      description: parsed.data.description,
      createdAt: new Date().toISOString(),
    };

    addSavingsEntry(entry);

    const allEntries = getSavingsByUserId(userId);
    const totalPortfolioValue = Math.round(
      allEntries.reduce((sum, e) => sum + e.currentBalance, 0) * 100
    ) / 100;

    res.status(201).json({ entry, totalPortfolioValue });
  } catch (error) {
    console.error("Create savings error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getSavings(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const entries = getSavingsByUserId(userId);
    const totalPortfolioValue = Math.round(
      entries.reduce((sum, e) => sum + e.currentBalance, 0) * 100
    ) / 100;

    res.status(200).json({ entries, totalPortfolioValue });
  } catch (error) {
    console.error("Get savings error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}
