import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { scenarioRequestSchema } from '../validators/ai.validator';
import { simulateScenario } from '../agents/scenarioSimulator.agent';
import { createScenario, findScenariosByUser, findScenarioById } from '../models/scenario.model';

export async function scenarioHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = scenarioRequestSchema.parse(req.body);
    const result = await simulateScenario(
      body.query,
      body.scenarioType,
      body.financialData,
      body.policyData,
    );

    // Persist scenario
    const scenario = await createScenario({
      userId: req.user!.userId,
      query: body.query,
      scenarioType: body.scenarioType as any,
      pathA: result.pathA,
      pathB: result.pathB,
      delta: result.delta,
      narrative: result.narrative,
      confidence: result.confidence as any,
    });

    sendSuccess(res, { ...result, id: scenario.id }, 201, 'Scenario simulated');
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function scenariosListHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const scenarios = await findScenariosByUser(req.user!.userId);
    sendSuccess(res, scenarios);
  } catch (err: any) {
    next(err);
  }
}

export async function scenarioByIdHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const scenario = await findScenarioById(req.params.id);
    if (!scenario) return sendError(res, 'Scenario not found', 404);
    if (scenario.userId !== req.user!.userId) return sendError(res, 'Forbidden', 403);
    sendSuccess(res, scenario);
  } catch (err: any) {
    next(err);
  }
}
