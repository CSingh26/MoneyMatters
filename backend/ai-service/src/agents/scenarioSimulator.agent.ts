import { chatJson } from '../services/anthropic.service';
import {
  SCENARIO_SIMULATOR_SYSTEM,
  buildScenarioUserMessage,
} from '../prompts/scenarioSimulator.prompt';
import { logger } from '../../shared/utils/logger';

export interface ScenarioResult {
  scenarioType: string;
  pathA: {
    label: string;
    monthlyProjections: { month: number; income: number; expenses: number; savings: number; netWorth: number }[];
    endState: { totalSavings: number; netWorth: number; debtRemaining: number };
  };
  pathB: {
    label: string;
    monthlyProjections: { month: number; income: number; expenses: number; savings: number; netWorth: number }[];
    endState: { totalSavings: number; netWorth: number; debtRemaining: number };
  };
  delta: {
    savingsDiff: number;
    netWorthDiff: number;
    monthsToRecover: number | null;
    riskLevel: string;
  };
  narrative: string;
  confidence: string;
}

export async function simulateScenario(
  query: string,
  scenarioType: string,
  financialData: Record<string, unknown>,
  policyData?: Record<string, unknown>,
): Promise<ScenarioResult> {
  const timeoutMs = Number(process.env.SCENARIO_TIMEOUT_MS) || 10000;

  const result = await Promise.race([
    chatJson<ScenarioResult>(
      SCENARIO_SIMULATOR_SYSTEM,
      buildScenarioUserMessage(query, scenarioType, financialData, policyData),
      { maxTokens: 4096, temperature: 0.4 },
    ),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Scenario simulation timed out')), timeoutMs),
    ),
  ]);

  logger.info('Scenario simulation complete', {
    type: result.scenarioType,
    riskLevel: result.delta.riskLevel,
    confidence: result.confidence,
  });

  return result;
}
