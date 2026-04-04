import { Router } from "express";
import { createIncome, getIncome } from "../controllers/income.controller";

const router = Router();

router.post("/", createIncome);
router.get("/", getIncome);

export default router;
