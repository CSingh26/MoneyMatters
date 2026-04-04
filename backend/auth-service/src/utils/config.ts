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
  port: parseInt(process.env["PORT"] || "3001", 10),
  jwtSecret: requireEnv("JWT_SECRET", 32),
  jwtAccessExpiry: process.env["JWT_ACCESS_EXPIRY"] || "15m",
  jwtRefreshExpiry: process.env["JWT_REFRESH_EXPIRY"] || "7d",
  corsOrigins: (process.env["CORS_ORIGINS"] || "http://localhost:3000,http://localhost:8081").split(","),
  bcryptSaltRounds: parseInt(process.env["BCRYPT_SALT_ROUNDS"] || "12", 10),
} as const;
