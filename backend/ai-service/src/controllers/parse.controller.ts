import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { parseRequestSchema } from '../validators/ai.validator';
import { parsePolicy } from '../agents/policyParser.agent';
import { createParseJob, updateParseJob } from '../models/scenario.model';
import { logger } from '../../shared/utils/logger';
import axios from 'axios';

const POLICY_SERVICE_URL = () => process.env.POLICY_SERVICE_URL ?? 'http://localhost:3003';

export async function parseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = parseRequestSchema.parse(req.body);

    // Create tracking job
    const job = await createParseJob({ policyId: body.policyId, userId: body.userId });
    await updateParseJob(job.id, { status: 'processing', startedAt: new Date() });

    // Respond immediately — parsing happens async
    sendSuccess(res, { jobId: job.id, status: 'processing' }, 202, 'Parse job started');

    // Async parsing
    (async () => {
      try {
        const result = await parsePolicy(body.pdfText, body.policyType);
        await updateParseJob(job.id, { status: 'done', result, completedAt: new Date() });

        // Notify policy service with parsed data
        const serviceKey = process.env.INTERNAL_SERVICE_KEY ?? '';
        await axios.patch(
          `${POLICY_SERVICE_URL()}/api/policies/internal/${body.policyId}/parse-result`,
          {
            parsedData: result,
            coverageScore: result.coverageScore.toString(),
            gaps: result.gaps,
            parseStatus: 'done',
            parsedAt: new Date().toISOString(),
          },
          { headers: { 'X-Internal-Service-Key': serviceKey }, timeout: 5000 },
        ).catch(() => {
          logger.warn('Could not notify policy service of parse result', { policyId: body.policyId });
        });
      } catch (err: any) {
        logger.error('Parse job failed', { jobId: job.id, error: err.message });
        await updateParseJob(job.id, {
          status: 'failed',
          errorMsg: err.message,
          completedAt: new Date(),
        });
      }
    })();
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
}

export async function parseStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { findParseJobByPolicy } = await import('../models/scenario.model');
    const job = await findParseJobByPolicy(req.params.policyId);
    if (!job) return sendError(res, 'Parse job not found', 404);
    sendSuccess(res, job);
  } catch (err: any) {
    next(err);
  }
}
