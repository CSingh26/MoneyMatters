import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, PolicyType, ParseStatus } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export interface CreatePolicyData {
  userId: string;
  type: PolicyType;
  originalName: string;
  storagePath: string;
  storageDriver: string;
  fileSizeBytes: number;
  renewalDate?: Date | null;
}

export async function createPolicy(data: CreatePolicyData) {
  return prisma.policy.create({ data });
}

export async function findPolicyById(id: string) {
  return prisma.policy.findUnique({ where: { id }, include: { gaps: true } });
}

export async function findPoliciesByUser(userId: string, filters?: {
  type?: PolicyType;
  parseStatus?: ParseStatus;
}) {
  return prisma.policy.findMany({
    where: { userId, ...filters },
    include: { gaps: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updatePolicy(id: string, data: Record<string, any>) {
  return prisma.policy.update({ where: { id }, data });
}

export async function deletePolicy(id: string) {
  return prisma.policy.delete({ where: { id } });
}

export async function createPolicyGaps(policyId: string, gaps: {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}[]) {
  return prisma.policyGap.createMany({
    data: gaps.map((g) => ({ policyId, ...g })),
  });
}

export { prisma };
