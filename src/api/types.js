/**
 * API Response Shape Reference
 *
 * All backend endpoints return: { success: boolean, data?: T, message?: string, error?: string }
 * The apiFetch wrapper in client.js throws on !success, so callers receive json directly.
 *
 * ─── Auth ───
 * POST /api/auth/register → { user, accessToken, refreshToken }
 * POST /api/auth/login    → { user, accessToken, refreshToken }
 * POST /api/auth/refresh  → { accessToken, refreshToken }
 * GET  /api/auth/profile   → { id, email, firstName, lastName, age, gender, createdAt }
 * PATCH /api/auth/profile  → { id, email, firstName, lastName, age, gender }
 *
 * ─── Finance ───
 * GET  /api/finance/income             → [{ id, name, amount, frequency, monthlyAmount, createdAt }]
 * GET  /api/finance/expenditure/fixed  → [{ id, name, category, amount, frequency, monthlyAmount, createdAt }]
 * GET  /api/finance/expenditure/variable → [{ id, name, category, estimatedMonthly, createdAt }]
 * GET  /api/finance/savings            → [{ id, type, description, currentBalance, monthlySavings, interestRate, createdAt }]
 * GET  /api/finance/goals              → [{ id, name, target, current, progress, status, deadline, createdAt }]
 * GET  /api/finance/summary            → { totalMonthlyIncome, totalMonthlyExpenses, totalSavingsBalance,
 *                                           totalMonthlySavings, netMonthlyCashFlow, savingsRate, goals }
 *
 * ─── Policies ───
 * POST /api/policies/       (FormData) → { id, fileName, status, createdAt }
 * GET  /api/policies/                  → [{ id, fileName, status, createdAt }]
 * GET  /api/policies/:id               → { id, fileName, status, parsedData, createdAt }
 * POST /api/policies/watchdog          → { analysis, recommendations }
 * POST /api/policies/scenario          → { id, question, response, createdAt }
 * GET  /api/policies/scenarios         → [{ id, question, response, createdAt }]
 *
 * ─── Dashboard ───
 * GET  /api/dashboard/                 → { financeSummary, policies, recentScenarios }
 */

// Error codes that may be returned in the error field
export const API_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
};
