import rateLimit, { Options } from 'express-rate-limit';

/**
 * Create a rate limiter using values from environment variables,
 * with sensible fallback defaults.
 */
export function createRateLimiter(overrides?: Partial<Options>) {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later' },
    ...overrides,
  });
}
