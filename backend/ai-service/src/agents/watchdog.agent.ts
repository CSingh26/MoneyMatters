import { chatJson } from '../services/anthropic.service';
import { WATCHDOG_SYSTEM, buildWatchdogUserMessage } from '../prompts/watchdog.prompt';
import { logger } from '../../shared/utils/logger';

export interface WatchdogAnalysis {
  healthScore: number;
  riskFlags: {
    flag: string;
    severity: string;
    detail: string;
    action: string;
  }[];
  recommendations: {
    category: string;
    title: string;
    detail: string;
    priority: string;
    potentialImpact: string;
  }[];
  monthlyBudget: {
    needs: number;
    wants: number;
    savings: number;
    total: number;
    suggested50_30_20: { needs: number; wants: number; savings: number };
  };
  narrative: string;
}

export async function analyzeFinances(
  financialData: Record<string, unknown>,
): Promise<WatchdogAnalysis> {
  const result = await chatJson<WatchdogAnalysis>(
    WATCHDOG_SYSTEM,
    buildWatchdogUserMessage(financialData),
    { maxTokens: 4096, temperature: 0.3 },
  );

  logger.info('Watchdog analysis complete', {
    healthScore: result.healthScore,
    flagCount: result.riskFlags.length,
    recCount: result.recommendations.length,
  });

  return result;
}
