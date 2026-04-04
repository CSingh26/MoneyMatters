import { Router } from "express";
import { getGoals, createGoal } from "../controllers/goals.controller";

const router = Router();

router.get("/", getGoals);
router.post("/", createGoal);

export default router;
