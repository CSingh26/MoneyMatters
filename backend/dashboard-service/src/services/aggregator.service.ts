import axios from 'axios';
import { logger } from '../../shared/utils/logger';

const AUTH_URL = () => process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
const FINANCE_URL = () => process.env.FINANCE_SERVICE_URL ?? 'http://localhost:3002';
const POLICY_URL = () => process.env.POLICY_SERVICE_URL ?? 'http://localhost:3003';
const AI_URL = () => process.env.AI_SERVICE_URL ?? 'http://localhost:3004';
const SERVICE_KEY = () => process.env.INTERNAL_SERVICE_KEY ?? '';

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

function serviceHeaders() {
  return { 'X-Internal-Service-Key': SERVICE_KEY() };
}

async function safeGet<T>(url: string, headers: Record<string, string>): Promise<T | null> {
  try {
    const res = await axios.get(url, { headers, timeout: 5000 });
    return res.data?.data ?? res.data ?? null;
  } catch (err: any) {
    logger.warn(`Dashboard aggregation failed for ${url}`, { error: err.message });
    return null;
  }
}

async function safePost<T>(url: string, body: unknown, headers: Record<string, string>): Promise<T | null> {
  try {
    const res = await axios.post(url, body, { headers, timeout: 10000 });
    return res.data?.data ?? res.data ?? null;
  } catch (err: any) {
    logger.warn(`Dashboard aggregation failed for ${url}`, { error: err.message });
    return null;
  }
}

export interface DashboardData {
  user: Record<string, unknown> | null;
  financeSummary: Record<string, unknown> | null;
  policies: Record<string, unknown>[] | null;
  watchdogAnalysis: Record<string, unknown> | null;
  recentScenarios: Record<string, unknown>[] | null;
}

export async function aggregateDashboard(
  userId: string,
  accessToken: string,
): Promise<DashboardData> {
  const auth = authHeaders(accessToken);

  // Parallel fetch all dashboard data
  const [user, financeSummary, policies, recentScenarios] = await Promise.all([
    safeGet<Record<string, unknown>>(`${AUTH_URL()}/api/auth/profile`, auth),
    safeGet<Record<string, unknown>>(`${FINANCE_URL()}/api/finance/summary`, auth),
    safeGet<Record<string, unknown>[]>(`${POLICY_URL()}/api/policies`, auth),
    safeGet<Record<string, unknown>[]>(`${AI_URL()}/api/ai/scenarios`, auth),
  ]);

  // Request watchdog analysis if finance data is available
  let watchdogAnalysis: Record<string, unknown> | null = null;
  if (financeSummary) {
    watchdogAnalysis = await safePost<Record<string, unknown>>(
      `${AI_URL()}/api/ai/watchdog`,
      { userId, financialData: financeSummary },
      auth,
    );
  }

  return {
    user,
    financeSummary,
    policies,
    watchdogAnalysis,
    recentScenarios,
  };
}
