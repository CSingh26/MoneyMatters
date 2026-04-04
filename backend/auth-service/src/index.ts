import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "./utils/config";
import authRoutes from "./routes/auth.routes";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.listen(config.port, () => {
  console.log(`Auth service running on port ${config.port}`);
});
