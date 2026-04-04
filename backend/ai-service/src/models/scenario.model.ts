import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ScenarioType, Confidence, JobStatus } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/* ── Parse Jobs ── */

export async function createParseJob(data: { policyId: string; userId: string }) {
  return prisma.aiParseJob.create({ data });
}

export async function updateParseJob(id: string, data: {
  status?: JobStatus;
  result?: any;
  errorMsg?: string;
  startedAt?: Date;
  completedAt?: Date;
}) {
  return prisma.aiParseJob.update({ where: { id }, data });
}

export async function findParseJobByPolicy(policyId: string) {
  return prisma.aiParseJob.findFirst({
    where: { policyId },
    orderBy: { createdAt: 'desc' },
  });
}

/* ── Scenarios ── */

export async function createScenario(data: {
  userId: string;
  query: string;
  scenarioType: ScenarioType;
  pathA: any;
  pathB: any;
  delta: any;
  narrative: string;
  confidence: Confidence;
}) {
  return prisma.aiScenario.create({ data });
}

export async function findScenariosByUser(userId: string) {
  return prisma.aiScenario.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function findScenarioById(id: string) {
  return prisma.aiScenario.findUnique({ where: { id } });
}

export { prisma };
