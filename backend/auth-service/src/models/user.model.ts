import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Gender, EmploymentStatus, IncomeRange } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastNameEnc: string;
  age: number;
  gender: Gender;
  occupation?: string;
  employmentStatus?: EmploymentStatus;
  incomeRange?: IncomeRange;
}

export async function createUser(data: CreateUserData) {
  return prisma.authUser.create({ data });
}

export async function findUserByEmail(email: string) {
  return prisma.authUser.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return prisma.authUser.findUnique({ where: { id } });
}

export async function updateUser(
  id: string,
  data: Partial<Pick<CreateUserData, 'firstName' | 'lastNameEnc' | 'age' | 'gender' | 'occupation' | 'employmentStatus' | 'incomeRange'>> & {
    lastLoginAt?: Date;
  },
) {
  return prisma.authUser.update({ where: { id }, data });
}

export async function deactivateUser(id: string) {
  return prisma.authUser.update({ where: { id }, data: { isActive: false } });
}

/* ── Refresh Tokens ── */

export async function createRefreshToken(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  return prisma.authRefreshToken.create({ data });
}

export async function findRefreshTokenByHash(tokenHash: string) {
  return prisma.authRefreshToken.findUnique({ where: { tokenHash } });
}

export async function revokeRefreshToken(id: string) {
  return prisma.authRefreshToken.update({ where: { id }, data: { isRevoked: true } });
}

export async function revokeAllUserTokens(userId: string) {
  return prisma.authRefreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });
}

export { prisma };
