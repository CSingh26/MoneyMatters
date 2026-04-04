import { Request, Response } from "express";

export async function getGoals(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ message: "Goals feature coming soon", goals: [] });
}

export async function createGoal(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ message: "Goals feature coming soon" });
}
