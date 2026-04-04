import { chatJson } from '../services/openai.service';
import { POLICY_PARSER_SYSTEM, buildParserUserMessage } from '../prompts/policyParser.prompt';
import { logger } from '../../../shared/utils/logger';

export interface ParsedPolicy {
  policyType: string;
  provider: string;
  policyNumber: string | null;
  effectiveDate: string | null;
  expirationDate: string | null;
  premium: { amount: number; frequency: string };
  deductible: number | null;
  coverageLimit: number | null;
  coverages: { name: string; limit: number | null; details: string }[];
  exclusions: string[];
  riders: string[];
  coverageScore: number;
  gaps: { description: string; severity: string; recommendation: string }[];
  summary: string;
}

export async function parsePolicy(
  pdfText: string,
  policyType?: string,
): Promise<ParsedPolicy> {
  const timeoutMs = Number(process.env.PARSE_TIMEOUT_MS) || 45000;

  const result = await Promise.race([
    chatJson<ParsedPolicy>(
      POLICY_PARSER_SYSTEM,
      buildParserUserMessage(pdfText, policyType),
      { maxTokens: 4096, temperature: 0.2 },
    ),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Policy parsing timed out')), timeoutMs),
    ),
  ]);

  logger.info('Policy parsed successfully', {
    type: result.policyType,
    coverageScore: result.coverageScore,
    gapCount: result.gaps.length,
  });

  return result;
}
