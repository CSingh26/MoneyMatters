import { chatJson } from '../services/openai.service';
import {
  ORCHESTRATOR_SYSTEM,
  buildOrchestratorUserMessage,
} from '../prompts/scenarioSimulator.prompt';
import { logger } from '../../../shared/utils/logger';

export interface OrchestratorPlan {
  agentsNeeded: string[];
  plan: {
    step: number;
    agent: string;
    action: string;
    inputSummary: string;
  }[];
  requiresFinancialData: boolean;
  requiresPolicyData: boolean;
  responseStrategy: string;
}

export async function orchestrate(
  query: string,
  context: Record<string, unknown>,
): Promise<OrchestratorPlan> {
  const result = await chatJson<OrchestratorPlan>(
    ORCHESTRATOR_SYSTEM,
    buildOrchestratorUserMessage(query, context),
    { maxTokens: 2048, temperature: 0.2 },
  );

  logger.info('Orchestrator plan created', {
    agentsNeeded: result.agentsNeeded,
    steps: result.plan.length,
  });

  return result;
}
