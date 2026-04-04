import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string, minLength?: number): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  if (minLength && value.length < minLength) {
    throw new Error(`Environment variable ${key} must be at least ${minLength} characters`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env["PORT"] || "3002", 10),
  jwtSecret: requireEnv("JWT_SECRET", 32),
  corsOrigins: (process.env["CORS_ORIGINS"] || "http://localhost:3000,http://localhost:8081").split(","),
} as const;
