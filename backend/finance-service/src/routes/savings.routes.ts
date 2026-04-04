import { Router } from "express";
import { createSavings, getSavings } from "../controllers/savings.controller";

const router = Router();

router.post("/", createSavings);
router.get("/", getSavings);

export default router;
