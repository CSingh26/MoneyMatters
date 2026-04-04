import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "./utils/config";
import { createAuthMiddleware } from "../../shared/middleware/auth";
import incomeRoutes from "./routes/income.routes";
import expenditureRoutes from "./routes/expenditure.routes";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());

// JWT authentication for all /finance routes
const authenticate = createAuthMiddleware(config.jwtSecret);

// Routes
app.use("/finance/income", authenticate, incomeRoutes);
app.use("/finance/expenditure", authenticate, expenditureRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "finance-service" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`Finance service running on port ${config.port}`);
});
