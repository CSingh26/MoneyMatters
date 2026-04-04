import { Router } from "express";
import { getFinancialSummary } from "../controllers/summary.controller";

const router = Router();

router.get("/", getFinancialSummary);

export default router;
