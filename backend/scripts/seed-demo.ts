#!/usr/bin/env tsx
/**
 * seed-demo.ts — Idempotent seeder for 4 demo accounts
 *
 * Run:  cd backend/auth-service && npx tsx ../scripts/seed-demo.ts
 *
 * Creates 4 fully-populated demo accounts across all 4 databases:
 *   policylens_auth    → demo users
 *   policylens_finance → income, expenses, savings, goals, assets (historical)
 *   policylens_policy  → policies + coverage gaps
 *   policylens_ai      → saved scenarios
 *
 * Each user has a different amount of historical data (1-7 years).
 * Re-running is safe: deletes old demo data, then re-inserts.
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const { Client } = pg;

function encrypt(plaintext: string, hexKey: string): string {
  const key = Buffer.from(hexKey, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

const ENC_KEY = process.env.ENCRYPTION_KEY || '75c63e2e62121bcbd04ded5765c90501f2ee961cc7a6daebbe5bc053cb88f0fd';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'chaitanyasingh';
const DB_PORT = Number(process.env.DB_PORT || 5432);

function dbUrl(name: string) {
  const sslSuffix = process.env.DB_SSL === 'true' ? '?sslmode=no-verify' : '';
  const password = process.env.DB_PASSWORD ? `:${process.env.DB_PASSWORD}` : '';
  return `postgresql://${DB_USER}${password}@${DB_HOST}:${DB_PORT}/${name}${sslSuffix}`;
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

// ─── Demo user definitions ───
interface DemoUser {
  email: string; password: string; firstName: string; lastName: string;
  age: number; gender: string; yearsOfData: number; healthScore: number;
  income: { name: string; amount: number; frequency: string }[];
  fixed: { name: string; category: string; amount: number }[];
  variable: { name: string; category: string; amount: number }[];
  savings: { type: string; desc: string; balance: number; monthly: number }[];
  goals: { name: string; target: number; current: number; deadline: string; status: string }[];
  assets: { name: string; type: string; value: number; description: string }[];
}

const USERS: DemoUser[] = [
  {
    email: 'demo@policylens.app', password: 'DemoUser@2026!',
    firstName: 'Maria', lastName: 'Garcia', age: 26, gender: 'female',
    yearsOfData: 3, healthScore: 75,
    income: [
      { name: 'Monthly Salary', amount: 5100, frequency: 'monthly' },
      { name: 'Freelance Design', amount: 800, frequency: 'monthly' },
    ],
    fixed: [
      { name: 'Mortgage Payment', category: 'mortgage', amount: 1200 },
      { name: 'Student Loan', category: 'student_loan', amount: 400 },
      { name: 'Insurance (Combined)', category: 'insurance', amount: 350 },
    ],
    variable: [
      { name: 'Food & Groceries', category: 'food_groceries', amount: 500 },
      { name: 'Shopping', category: 'shopping', amount: 450 },
      { name: 'Transport', category: 'transport', amount: 350 },
      { name: 'Dining Out', category: 'dining_out', amount: 200 },
    ],
    savings: [
      { type: 'liquid_savings', desc: 'Emergency Savings Account', balance: 8500, monthly: 800 },
      { type: 'stocks', desc: 'Investment Portfolio', balance: 12000, monthly: 1050 },
      { type: 'retirement_401k', desc: '401(k) Retirement', balance: 24000, monthly: 500 },
    ],
    goals: [
      { name: 'Emergency Fund', target: 15000, current: 8500, deadline: '2025-12-31', status: 'active' },
      { name: 'Vacation Fund', target: 5000, current: 2200, deadline: '2026-06-01', status: 'active' },
    ],
    assets: [
      { name: 'Honda Civic 2022', type: 'vehicle', value: 22000, description: 'Reliable daily commuter' },
      { name: 'MacBook Pro 16"', type: 'electronics', value: 2500, description: 'Primary work laptop' },
      { name: 'Gold Necklace', type: 'jewelry', value: 1800, description: 'Family heirloom' },
    ],
  },
  {
    email: 'james@policylens.app', password: 'James@2026!',
    firstName: 'James', lastName: 'Wilson', age: 34, gender: 'male',
    yearsOfData: 7, healthScore: 88,
    income: [
      { name: 'Software Engineer Salary', amount: 9200, frequency: 'monthly' },
      { name: 'Stock Dividends', amount: 350, frequency: 'monthly' },
    ],
    fixed: [
      { name: 'Mortgage Payment', category: 'mortgage', amount: 2200 },
      { name: 'Car Loan (Tesla)', category: 'car_loan', amount: 650 },
      { name: 'Home Insurance', category: 'insurance', amount: 280 },
      { name: 'Utilities Bundle', category: 'utilities', amount: 320 },
    ],
    variable: [
      { name: 'Groceries & Meal Prep', category: 'food_groceries', amount: 700 },
      { name: 'Gas & Charging', category: 'gas', amount: 150 },
      { name: 'Entertainment & Streaming', category: 'entertainment', amount: 180 },
      { name: 'Shopping & Tech', category: 'shopping', amount: 300 },
      { name: 'Healthcare Copays', category: 'healthcare', amount: 120 },
    ],
    savings: [
      { type: 'liquid_savings', desc: 'High-Yield Savings', balance: 35000, monthly: 2000 },
      { type: 'stocks', desc: 'Tech Stock Portfolio', balance: 87000, monthly: 1500 },
      { type: 'index_funds', desc: 'Vanguard S&P 500', balance: 62000, monthly: 1000 },
      { type: 'retirement_401k', desc: '401(k) Maxed', balance: 145000, monthly: 1875 },
      { type: 'crypto', desc: 'Bitcoin & Ethereum', balance: 15000, monthly: 200 },
    ],
    goals: [
      { name: 'Down Payment Fund', target: 80000, current: 62000, deadline: '2026-06-01', status: 'active' },
      { name: 'Emergency Fund (6 mo)', target: 30000, current: 35000, deadline: '2025-01-01', status: 'completed' },
    ],
    assets: [
      { name: 'Tesla Model 3 2023', type: 'vehicle', value: 38000, description: 'Long Range AWD' },
      { name: 'Condo (Shared Equity)', type: 'real_estate', value: 180000, description: '2BR downtown condo' },
      { name: 'Gaming PC Setup', type: 'electronics', value: 4200, description: 'RTX 4090 custom build' },
      { name: 'Rolex Submariner', type: 'jewelry', value: 12000, description: 'Investment timepiece' },
      { name: 'Vintage Guitar Collection', type: 'collectibles', value: 8500, description: '3 vintage Fenders' },
    ],
  },
  {
    email: 'priya@policylens.app', password: 'Priya@2026!',
    firstName: 'Priya', lastName: 'Patel', age: 29, gender: 'female',
    yearsOfData: 4, healthScore: 70,
    income: [
      { name: 'Marketing Manager Salary', amount: 6800, frequency: 'monthly' },
    ],
    fixed: [
      { name: 'Rent', category: 'rent', amount: 1800 },
      { name: 'Car Payment', category: 'car_loan', amount: 420 },
      { name: 'Subscriptions', category: 'subscriptions', amount: 85 },
      { name: 'Health Insurance', category: 'insurance', amount: 220 },
    ],
    variable: [
      { name: 'Groceries', category: 'food_groceries', amount: 450 },
      { name: 'Dining & Delivery', category: 'dining_out', amount: 380 },
      { name: 'Shopping', category: 'shopping', amount: 350 },
      { name: 'Ride Share', category: 'transport', amount: 200 },
      { name: 'Gym & Wellness', category: 'healthcare', amount: 130 },
    ],
    savings: [
      { type: 'liquid_savings', desc: 'Chase Savings', balance: 12000, monthly: 500 },
      { type: 'index_funds', desc: 'Fidelity Index', balance: 28000, monthly: 600 },
      { type: 'ira', desc: 'Roth IRA', balance: 18000, monthly: 500 },
    ],
    goals: [
      { name: 'New Car Down Payment', target: 12000, current: 7500, deadline: '2026-03-01', status: 'active' },
      { name: 'Bali Trip', target: 4000, current: 1800, deadline: '2025-11-01', status: 'active' },
    ],
    assets: [
      { name: 'Toyota Camry 2021', type: 'vehicle', value: 19000, description: 'Reliable sedan' },
      { name: 'iPad Pro & Accessories', type: 'electronics', value: 1600, description: 'For work presentations' },
      { name: 'Dining Room Set', type: 'furniture', value: 3200, description: 'Solid oak 6-seater' },
    ],
  },
  {
    email: 'marcus@policylens.app', password: 'Marcus@2026!',
    firstName: 'Marcus', lastName: 'Johnson', age: 42, gender: 'male',
    yearsOfData: 1, healthScore: 55,
    income: [
      { name: 'Restaurant Manager Salary', amount: 4200, frequency: 'monthly' },
      { name: 'Weekend Catering', amount: 600, frequency: 'monthly' },
    ],
    fixed: [
      { name: 'Rent', category: 'rent', amount: 1400 },
      { name: 'Personal Loan', category: 'personal_loan', amount: 350 },
      { name: 'Utilities', category: 'utilities', amount: 180 },
    ],
    variable: [
      { name: 'Groceries', category: 'food_groceries', amount: 600 },
      { name: 'Gas', category: 'gas', amount: 250 },
      { name: 'Miscellaneous', category: 'misc', amount: 300 },
    ],
    savings: [
      { type: 'liquid_savings', desc: 'Checking Overflow', balance: 3200, monthly: 200 },
      { type: 'locked_cd', desc: '12-Month CD', balance: 5000, monthly: 0 },
    ],
    goals: [
      { name: 'Emergency Fund', target: 10000, current: 3200, deadline: '2026-12-31', status: 'active' },
    ],
    assets: [
      { name: 'Ford F-150 2019', type: 'vehicle', value: 25000, description: 'Used for catering deliveries' },
      { name: 'Commercial Kitchen Equipment', type: 'other', value: 8000, description: 'Portable catering gear' },
    ],
  },
];

const POLICY_TEMPLATES = [
  {
    type: 'auto', originalName: 'StateFarm_Auto_Policy.pdf',
    coverageScore: 'Well Covered', renewalDate: '2026-01-15',
    parsedData: {
      provider: 'StateFarm', premium: 175, premiumFrequency: 'monthly',
      covered: ['Collision damage up to $50,000', 'Liability coverage: $100k/$300k', 'Comprehensive (theft, weather, animals)', 'Uninsured motorist coverage', 'Roadside assistance'],
      excluded: ['Wear and tear or mechanical breakdown', 'Personal belongings inside the vehicle', 'Commercial use of the vehicle'],
      limits: { propertyDamage: 50000, liability: 100000 },
    },
  },
  {
    type: 'renters', originalName: 'Lemonade_Renters_Policy.pdf',
    coverageScore: 'Gaps Found', renewalDate: '2025-09-30',
    parsedData: {
      provider: 'Lemonade', premium: 25, premiumFrequency: 'monthly',
      covered: ['Personal property up to $10,000', 'Liability coverage: $100,000', 'Additional living expenses if displaced', 'Medical payments to others: $1,000'],
      excluded: ['Flood damage', 'Earthquake damage', 'High-value jewelry over $1,500', 'Business equipment'],
      limits: { personalProperty: 10000, liability: 100000 },
    },
  },
  {
    type: 'health', originalName: 'BlueCross_Health_Policy.pdf',
    coverageScore: 'Well Covered', renewalDate: '2025-12-31',
    parsedData: {
      provider: 'Blue Cross', premium: 280, premiumFrequency: 'monthly',
      covered: ['Preventive care: 100% covered', 'Emergency room visits (after $250 copay)', 'Prescription drugs (tiered copay)', 'Mental health services', 'Specialist visits with referral'],
      excluded: ['Cosmetic procedures', 'Experimental treatments', 'Out-of-network providers (limited)', 'Dental and vision (separate plan needed)'],
      limits: { annualMax: 500000, deductible: 1500 },
    },
  },
];

const GAPS = [
  { policyType: 'renters', description: "Your renter's insurance personal property limit is $10,000, but your tracked assets may exceed this.", severity: 'high', recommendation: 'Increase personal property coverage to at least $20,000 or add a scheduled personal property endorsement.' },
  { policyType: 'auto', description: 'Your auto insurance collision coverage is solid. Monitor vehicle depreciation to optimize premiums.', severity: 'low', recommendation: 'Consider reducing collision coverage after vehicle depreciation to save on premiums.' },
  { policyType: 'renters', description: "Your renter's insurance explicitly excludes flood damage.", severity: 'medium', recommendation: 'Purchase NFIP flood insurance (~$30/mo) if your area has any flood risk.' },
  { policyType: 'health', description: 'Your health plan covers emergency, preventive, and mental health. Consider adding a dental/vision rider.', severity: 'low', recommendation: 'Add dental + vision plan (~$30/mo) to prevent surprise out-of-pocket costs.' },
];

const SCENARIOS = [
  {
    query: 'What happens if I lose my job for 3 months?', scenarioType: 'income_shock',
    pathA: { title: 'Path A — Current Trajectory', narrative: 'Steady income with manageable expenses.', metrics: { savings: 'Positive', runway: 'Several months', riskLevel: 'Moderate' } },
    pathB: { title: 'Path B — 3-Month Job Loss', narrative: 'Essential expenses would deplete savings without income.', metrics: { savings: 'Depleted', runway: 'Reduced', riskLevel: 'High' } },
    delta: { savingsImpact: -9750, runwayChange: -2.1 },
    narrative: 'Build emergency fund to cover 6 months of expenses.', confidence: 'high',
  },
  {
    query: 'What if my car is totaled?', scenarioType: 'property',
    pathA: { title: 'Path A — Current Coverage', narrative: 'Auto insurance covers collision and comprehensive.', metrics: { coveredAmount: 'Policy limit', deductible: '$500', outOfPocket: '$500' } },
    pathB: { title: 'Path B — Car Totaled', narrative: 'Insurance pays ACV minus deductible. Replacement gap may exist.', metrics: { payout: 'ACV - deductible', replacementCost: 'Market rate', gap: 'Varies' } },
    delta: { insurancePayout: 21500, outOfPocket: 1500 },
    narrative: 'Consider gap insurance if loan exceeds car value.', confidence: 'high',
  },
  {
    query: 'What if I have a medical emergency?', scenarioType: 'medical',
    pathA: { title: 'Path A — Current Health Coverage', narrative: 'Health plan has deductible with OOP max.', metrics: { deductible: '$1,500', maxOOP: '$6,500', annualMax: '$500,000' } },
    pathB: { title: 'Path B — Major Medical Event', narrative: 'Major event $30k-$50k. Plan covers 80% after deductible. Max OOP limits exposure.', metrics: { totalCost: '~$40,000', youPay: '$6,500', savingsAfter: 'Reduced' } },
    delta: { savingsImpact: -6500, healthCost: 40000 },
    narrative: 'Consider an HSA for pre-tax medical savings.', confidence: 'medium',
  },
];

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
async function main() {
  console.log('🌱 Seeding 4 demo accounts...\n');

  for (const user of USERS) {
    console.log(`\n━━━ ${user.firstName} ${user.lastName} (${user.email}) — ${user.yearsOfData} yr(s) of data ━━━`);

    // 1. AUTH
    const authDb = new Client({ connectionString: dbUrl('policylens_auth') });
    await authDb.connect();
    let userId: string;
    try {
      const existing = await authDb.query('SELECT id FROM auth_users WHERE email = $1', [user.email]);
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        const passwordHash = await bcrypt.hash(user.password, 12);
        await authDb.query('UPDATE auth_users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);
        console.log(`  ✓ User exists (${userId}) — password refreshed`);
      } else {
        const passwordHash = await bcrypt.hash(user.password, 12);
        const lastNameEnc = encrypt(user.lastName, ENC_KEY);
        const result = await authDb.query(
          `INSERT INTO auth_users (id, email, password_hash, first_name, last_name_enc, age, gender, is_active, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW()) RETURNING id`,
          [user.email, passwordHash, user.firstName, lastNameEnc, user.age, user.gender],
        );
        userId = result.rows[0].id;
        console.log(`  ✓ Created user: ${userId}`);
      }
    } finally { await authDb.end(); }

    // 2. FINANCE
    const finDb = new Client({ connectionString: dbUrl('policylens_finance') });
    await finDb.connect();
    try {
      await finDb.query('DELETE FROM finance_profiles WHERE user_id = $1', [userId]);
      const profile = await finDb.query(
        `INSERT INTO finance_profiles (id, user_id, health_score, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING id`,
        [userId, user.healthScore, monthsAgo(user.yearsOfData * 12)],
      );
      const pid = profile.rows[0].id;

      // Income — one record per month with ±10% variance
      const totalMonths = user.yearsOfData * 12;
      for (const inc of user.income) {
        for (let m = 0; m < totalMonths; m++) {
          const variance = 1 + (Math.random() * 0.2 - 0.1);
          const amount = Math.round(inc.amount * variance);
          const ts = monthsAgo(totalMonths - m);
          await finDb.query(
            `INSERT INTO finance_income_items (id, profile_id, name, amount_enc, frequency, monthly_amount, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $6)`,
            [pid, inc.name, encrypt(String(amount), ENC_KEY), inc.frequency, amount, ts],
          );
        }
      }

      // Fixed expenses — single record each (current values)
      for (const f of user.fixed) {
        const ts = monthsAgo(user.yearsOfData * 12);
        await finDb.query(
          `INSERT INTO finance_fixed_expenditures (id, profile_id, name, category, amount_enc, frequency, monthly_amount, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'monthly', $5, $6, $6)`,
          [pid, f.name, f.category, encrypt(String(f.amount), ENC_KEY), f.amount, ts],
        );
      }

      // Variable expenses — one record per month with ±20% variance
      for (const v of user.variable) {
        for (let m = 0; m < totalMonths; m++) {
          const variance = 1 + (Math.random() * 0.4 - 0.2);
          const amount = Math.round(v.amount * variance);
          const ts = monthsAgo(totalMonths - m);
          await finDb.query(
            `INSERT INTO finance_variable_expenditures (id, profile_id, name, category, estimated_monthly_enc, estimated_monthly, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $6)`,
            [pid, v.name, v.category, encrypt(String(amount), ENC_KEY), amount, ts],
          );
        }
      }

      // Savings
      for (const s of user.savings) {
        await finDb.query(
          `INSERT INTO finance_savings_items (id, profile_id, type, description, current_balance_enc, current_balance, monthly_savings_enc, monthly_savings, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [pid, s.type, s.desc, encrypt(String(s.balance), ENC_KEY), s.balance, encrypt(String(s.monthly), ENC_KEY), s.monthly],
        );
      }

      // Goals
      for (const g of user.goals) {
        await finDb.query(
          `INSERT INTO finance_goals (id, profile_id, name, target_enc, target, current_enc, current, deadline, status, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [pid, g.name, encrypt(String(g.target), ENC_KEY), g.target, encrypt(String(g.current), ENC_KEY), g.current, new Date(g.deadline), g.status],
        );
      }

      // Assets
      for (const a of user.assets) {
        await finDb.query(
          `INSERT INTO finance_assets (id, profile_id, name, type, estimated_value_enc, estimated_value, description, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [pid, a.name, a.type, encrypt(String(a.value), ENC_KEY), a.value, a.description],
        );
      }

      const incTotal = user.income.length * totalMonths;
      const varTotal = user.variable.length * totalMonths;
      console.log(`  ✓ Finance: ${incTotal} income · ${user.fixed.length} fixed · ${varTotal} variable · ${user.savings.length} savings · ${user.goals.length} goals · ${user.assets.length} assets`);
    } finally { await finDb.end(); }

    // 3. POLICY
    const polDb = new Client({ connectionString: dbUrl('policylens_policy') });
    await polDb.connect();
    try {
      await polDb.query('DELETE FROM policy_documents WHERE user_id = $1', [userId]);
      const policyIds: Record<string, string> = {};
      for (const p of POLICY_TEMPLATES) {
        const res = await polDb.query(
          `INSERT INTO policy_documents (id, user_id, type, original_name, storage_path, storage_driver, file_size_bytes, parse_status, parsed_data, coverage_score, renewal_date, parsed_at, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'local', 0, 'done', $5::jsonb, $6, $7, NOW(), NOW(), NOW()) RETURNING id`,
          [userId, p.type, p.originalName, `demo/${p.originalName}`, JSON.stringify(p.parsedData), p.coverageScore, new Date(p.renewalDate)],
        );
        policyIds[p.type] = res.rows[0].id;
      }
      for (const g of GAPS) {
        if (policyIds[g.policyType]) {
          await polDb.query(
            `INSERT INTO policy_gaps (id, policy_id, description, severity, recommendation, created_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
            [policyIds[g.policyType], g.description, g.severity, g.recommendation],
          );
        }
      }
      console.log(`  ✓ Policies: ${POLICY_TEMPLATES.length} policies · ${GAPS.length} gaps`);
    } finally { await polDb.end(); }

    // 4. AI SCENARIOS
    const aiDb = new Client({ connectionString: dbUrl('policylens_ai') });
    await aiDb.connect();
    try {
      await aiDb.query('DELETE FROM ai_scenarios WHERE user_id = $1', [userId]);
      for (const s of SCENARIOS) {
        await aiDb.query(
          `INSERT INTO ai_scenarios (id, user_id, query, scenario_type, path_a, path_b, delta, narrative, confidence, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, NOW())`,
          [userId, s.query, s.scenarioType, JSON.stringify(s.pathA), JSON.stringify(s.pathB), JSON.stringify(s.delta), s.narrative, s.confidence],
        );
      }
      console.log(`  ✓ AI scenarios: ${SCENARIOS.length} saved`);
    } finally { await aiDb.end(); }
  }

  console.log('\n\n✅ All 4 demo accounts ready!\n');
  console.log('┌─────────────────────────────────────────────────┐');
  for (const u of USERS) {
    console.log(`│  ${u.firstName.padEnd(8)} ${u.email.padEnd(26)} ${u.yearsOfData}yr  │`);
  }
  console.log('└─────────────────────────────────────────────────┘');
  console.log(`\n  Passwords: Maria=DemoUser@2026!, others={FirstName}@2026!\n`);
}

main().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });