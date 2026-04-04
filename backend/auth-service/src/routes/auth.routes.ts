import { Router } from "express";
import { register, login, refresh, me } from "../controllers/auth.controller";
import { registerLimiter, loginLimiter } from "../middleware/rateLimiter";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);

export default router;
