import { Request } from 'express';

/* ──────────────── Auth ──────────────── */

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export enum Gender {
  male = 'male',
  female = 'female',
  non_binary = 'non_binary',
  prefer_not_to_say = 'prefer_not_to_say',
}

/* ──────────────── Finance ──────────────── */

export enum IncomeFrequency {
  monthly = 'monthly',
  biweekly = 'biweekly',
}

export enum ExpenseFrequency {
  monthly = 'monthly',
  biweekly = 'biweekly',
  annual = 'annual',
}

export enum FixedCategory {
  mortgage = 'mortgage',
  rent = 'rent',
  car_loan = 'car_loan',
  student_loan = 'student_loan',
  personal_loan = 'personal_loan',
  utilities = 'utilities',
  insurance = 'insurance',
  subscriptions = 'subscriptions',
  other = 'other',
}

export enum VariableCategory {
  gas = 'gas',
  food_groceries = 'food_groceries',
  dining_out = 'dining_out',
  shopping = 'shopping',
  entertainment = 'entertainment',
  healthcare = 'healthcare',
  transport = 'transport',
  misc = 'misc',
}

export enum SavingsType {
  liquid_savings = 'liquid_savings',
  stocks = 'stocks',
  index_funds = 'index_funds',
  retirement_401k = 'retirement_401k',
  ira = 'ira',
  locked_cd = 'locked_cd',
  crypto = 'crypto',
  other = 'other',
}

export enum GoalStatus {
  active = 'active',
  completed = 'completed',
  paused = 'paused',
}

/* ──────────────── Policy ──────────────── */

export enum PolicyType {
  auto = 'auto',
  home = 'home',
  renters = 'renters',
  health = 'health',
  life = 'life',
}

export enum ParseStatus {
  pending = 'pending',
  processing = 'processing',
  done = 'done',
  failed = 'failed',
}

export enum GapSeverity {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

/* ──────────────── AI ──────────────── */

export enum ScenarioType {
  income_shock = 'income_shock',
  medical = 'medical',
  policy_change = 'policy_change',
  property = 'property',
}

export enum Confidence {
  high = 'high',
  medium = 'medium',
  low = 'low',
}

export enum JobStatus {
  queued = 'queued',
  processing = 'processing',
  done = 'done',
  failed = 'failed',
}

/* ──────────────── API Response ──────────────── */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

/* ──────────────── Service-to-Service ──────────────── */

export interface ServiceRequest extends Request {
  isInternalService?: boolean;
}
