import axios from 'axios';
import { createPolicy, findPolicyById, findPoliciesByUser, updatePolicy, deletePolicy } from '../models/policy.model';
import { extractTextFromPdf } from '../utils/pdf.utils';
import { deleteFile } from './upload.service';
import { logger } from '../../shared/utils/logger';
import type { PolicyType, ParseStatus } from '@prisma/client';

const AI_SERVICE_URL = () => process.env.AI_SERVICE_URL ?? 'http://localhost:3004';
const AI_KEY = () => process.env.AI_SERVICE_INTERNAL_KEY ?? process.env.INTERNAL_SERVICE_KEY ?? '';

export async function uploadPolicy(userId: string, file: Express.Multer.File, type: string, renewalDate?: string) {
  const policy = await createPolicy({
    userId,
    type: type as PolicyType,
    originalName: file.originalname,
    storagePath: file.path,
    storageDriver: process.env.STORAGE_DRIVER ?? 'local',
    fileSizeBytes: file.size,
    renewalDate: renewalDate ? new Date(renewalDate) : null,
  });

  // Trigger async AI parsing (fire-and-forget)
  triggerParsing(policy.id, file.path, userId).catch((err) =>
    logger.error('Failed to trigger AI parsing', { error: err.message, policyId: policy.id }),
  );

  return policy;
}

export async function getPolicy(id: string, userId: string) {
  const policy = await findPolicyById(id);
  if (!policy) throw Object.assign(new Error('Policy not found'), { status: 404 });
  if (policy.userId !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  return policy;
}

export async function listPolicies(userId: string, filters?: { type?: PolicyType; parseStatus?: ParseStatus }) {
  return findPoliciesByUser(userId, filters);
}

export async function removePolicy(id: string, userId: string) {
  const policy = await findPolicyById(id);
  if (!policy) throw Object.assign(new Error('Policy not found'), { status: 404 });
  if (policy.userId !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  // Delete file from disk
  if (policy.storageDriver === 'local') {
    deleteFile(policy.storagePath);
  }

  return deletePolicy(id);
}

async function triggerParsing(policyId: string, filePath: string, userId: string) {
  const pdfText = await extractTextFromPdf(filePath);

  await axios.post(
    `${AI_SERVICE_URL()}/api/ai/parse`,
    { policyId, pdfText, userId },
    { headers: { 'X-Internal-Service-Key': AI_KEY() }, timeout: 5000 },
  );
}
