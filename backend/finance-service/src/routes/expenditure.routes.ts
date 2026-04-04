import { Router } from "express";
import {
  createFixedExpenditure,
  createVariableExpenditure,
  getExpenditure,
} from "../controllers/expenditure.controller";

const router = Router();

router.post("/fixed", createFixedExpenditure);
router.post("/variable", createVariableExpenditure);
router.get("/", getExpenditure);

export default router;
