#!/usr/bin/env tsx
/**
 * seed-demo.ts — Idempotent seeder for demo@policylens.app
 *
 * Run:  cd backend/auth-service && npx tsx ../scripts/seed-demo.ts
 *
 * Creates a fully-populated demo account across all 4 databases:
 *   policylens_auth    → demo user
 *   policylens_finance → income, expenses, savings, goal
 *   policylens_policy  → 3 policies + 4 coverage gaps
 *   policylens_ai      → 3 saved scenarios
 *
 * Re-running is safe: deletes old demo data, then re-inserts.
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const { Client } = pg;

// ─── AES-256-GCM encrypt (mirrors backend/shared/utils/crypto.ts) ───
function encrypt(plaintext: string, hexKey: string): string {
  const key = Buffer.from(hexKey, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

// ─── Demo account constants ───
const DEMO = {
  email: 'demo@policylens.app',
  password: 'DemoUser@2026!',
  firstName: 'Maria',
  lastName: 'Garcia',
  age: 26,
  gender: 'female',
};

const ENC_KEY =
  process.env.ENCRYPTION_KEY ||
  '75c63e2e62121bcbd04ded5765c90501f2ee961cc7a6daebbe5bc053cb88f0fd';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'chaitanyasingh';
const DB_PORT = Number(process.env.DB_PORT || 5432);

function dbUrl(name: string) {
  return `postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${name}`;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log('🌱 Seeding demo account: demo@policylens.app\n');

  // ─── 1. AUTH ───────────────────────────────────────────
  const authDb = new Client({ connectionString: dbUrl('policylens_auth') });
  await authDb.connect();

  let userId: string;

  try {
    const existing = await authDb.query(
      'SELECT id FROM auth_users WHERE email = $1',
      [DEMO.email],
    );

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      // Re-hash password in case it changed
      const passwordHash = await bcrypt.hash(DEMO.password, 12);
      await authDb.query(
        'UPDATE auth_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, userId],
      );
      console.log(`✓ Demo user already exists (${userId}) — password refreshed`);
    } else {
      const passwordHash = await bcrypt.hash(DEMO.password, 12);
      const lastNameEnc = encrypt(DEMO.lastName, ENC_KEY);
      const result = await authDb.query(
        `INSERT INTO auth_users
           (id, email, password_hash, first_name, last_name_enc, age, gender, is_active, created_at, updated_at)
         VALUES
           (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
         RETURNING id`,
        [DEMO.email, passwordHash, DEMO.firstName, lastNameEnc, DEMO.age, DEMO.gender],
      );
      userId = result.rows[0].id;
      console.log(`✓ Created demo user: ${userId}`);
    }
  } finally {
    await authDb.end();
  }

  // ─── 2. FINANCE ────────────────────────────────────────
  const finDb = new Client({ connectionString: dbUrl('policylens_finance') });
  await finDb.connect();

  try {
    // Wipe previous demo finance data (cascade via FK)
    await finDb.query('DELETE FROM finance_profiles WHERE user_id = $1', [userId]);

    // Profile
    const profile = await finDb.query(
      `INSERT INTO finance_profiles (id, user_id, health_score, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 75, NOW(), NOW()) RETURNING id`,
      [userId],
    );
    const pid = profile.rows[0].id;

    // Income: Monthly Salary $5,100
    await finDb.query(
      `INSERT INTO finance_income_items
         (id, profile_id, name, amount_enc, frequency, monthly_amount, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'monthly', $4, NOW(), NOW())`,
      [pid, 'Monthly Salary', encrypt('5100', ENC_KEY), 5100],
    );

    // Fixed expenses (total = $1,950)
    const fixed = [
      { name: 'Mortgage Payment', category: 'mortgage', amount: 1200 },
      { name: 'Student Loan', category: 'student_loan', amount: 400 },
      { name: 'Insurance (Combined)', category: 'insurance', amount: 350 },
    ];
    for (const f of fixed) {
      await finDb.query(
        `INSERT INTO finance_fixed_expenditures
           (id, profile_id, name, category, amount_enc, frequency, monthly_amount, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'monthly', $5, NOW(), NOW())`,
        [pid, f.name, f.category, encrypt(String(f.amount), ENC_KEY), f.amount],
      );
    }

    // Variable expenses (total = $1,300)
    const variable = [
      { name: 'Food & Groceries', category: 'food_groceries', amount: 500 },
      { name: 'Shopping', category: 'shopping', amount: 450 },
      { name: 'Transport', category: 'transport', amount: 350 },
    ];
    for (const v of variable) {
      await finDb.query(
        `INSERT INTO finance_variable_expenditures
           (id, profile_id, name, category, estimated_monthly_enc, estimated_monthly, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())`,
        [pid, v.name, v.category, encrypt(String(v.amount), ENC_KEY), v.amount],
      );
    }

    // Savings items
    const savings = [
      { type: 'liquid_savings', desc: 'Emergency Savings Account', balance: 8500, monthly: 800 },
      { type: 'stocks', desc: 'Investment Portfolio', balance: 12000, monthly: 1050 },
    ];
    for (const s of savings) {
      await finDb.query(
        `INSERT INTO finance_savings_items
           (id, profile_id, type, description, current_balance_enc, current_balance,
            monthly_savings_enc, monthly_savings, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          pid, s.type, s.desc,
          encrypt(String(s.balance), ENC_KEY), s.balance,
          encrypt(String(s.monthly), ENC_KEY), s.monthly,
        ],
      );
    }

    // Goal: Emergency Fund
    await finDb.query(
      `INSERT INTO finance_goals
         (id, profile_id, name, target_enc, target, current_enc, current, deadline, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW())`,
      [
        pid, 'Emergency Fund',
        encrypt('15000', ENC_KEY), 15000,
        encrypt('8500', ENC_KEY), 8500,
        new Date('2025-12-31'),
      ],
    );

    console.log('✓ Finance profile seeded (1 income · 3 fixed · 3 variable · 2 savings · 1 goal)');
  } finally {
    await finDb.end();
  }

  // ─── 3. POLICY ─────────────────────────────────────────
  const polDb = new Client({ connectionString: dbUrl('policylens_policy') });
  await polDb.connect();

  try {
    await polDb.query('DELETE FROM policy_documents WHERE user_id = $1', [userId]);

    const policyRows = [
      {
        type: 'auto',
        originalName: 'StateFarm_Auto_Policy.pdf',
        coverageScore: 'Well Covered',
        renewalDate: '2026-01-15',
        parsedData: {
          provider: 'StateFarm',
          premium: 175,
          premiumFrequency: 'monthly',
          covered: [
            'Collision damage up to $50,000',
            'Liability coverage: $100k/$300k',
            'Comprehensive (theft, weather, animals)',
            'Uninsured motorist coverage',
            'Roadside assistance',
          ],
          excluded: [
            'Wear and tear or mechanical breakdown',
            'Personal belongings inside the vehicle',
            'Commercial use of the vehicle',
          ],
          limits: { propertyDamage: 50000, liability: 100000 },
        },
      },
      {
        type: 'renters',
        originalName: 'Lemonade_Renters_Policy.pdf',
        coverageScore: 'Gaps Found',
        renewalDate: '2025-09-30',
        parsedData: {
          provider: 'Lemonade',
          premium: 25,
          premiumFrequency: 'monthly',
          covered: [
            'Personal property up to $10,000',
            'Liability coverage: $100,000',
            'Additional living expenses if displaced',
            'Medical payments to others: $1,000',
          ],
          excluded: [
            'Flood damage',
            'Earthquake damage',
            'High-value jewelry over $1,500',
            'Business equipment',
          ],
          limits: { personalProperty: 10000, liability: 100000 },
        },
      },
      {
        type: 'health',
        originalName: 'BlueCross_Health_Policy.pdf',
        coverageScore: 'Well Covered',
        renewalDate: '2025-12-31',
        parsedData: {
          provider: 'Blue Cross',
          premium: 280,
          premiumFrequency: 'monthly',
          covered: [
            'Preventive care: 100% covered',
            'Emergency room visits (after $250 copay)',
            'Prescription drugs (tiered copay)',
            'Mental health services',
            'Specialist visits with referral',
          ],
          excluded: [
            'Cosmetic procedures',
            'Experimental treatments',
            'Out-of-network providers (limited)',
            'Dental and vision (separate plan needed)',
          ],
          limits: { annualMax: 500000, deductible: 1500 },
        },
      },
    ];

    const policyIds: Record<string, string> = {};

    for (const p of policyRows) {
      const res = await polDb.query(
        `INSERT INTO policy_documents
           (id, user_id, type, original_name, storage_path, storage_driver,
            file_size_bytes, parse_status, parsed_data, coverage_score,
            renewal_date, parsed_at, created_at, updated_at)
         VALUES
           (gen_random_uuid(), $1, $2, $3, $4, 'local', $5, 'done',
            $6::jsonb, $7, $8, NOW(), NOW(), NOW())
         RETURNING id`,
        [
          userId, p.type, p.originalName,
          `demo/${p.originalName}`, 0,
          JSON.stringify(p.parsedData), p.coverageScore,
          new Date(p.renewalDate),
        ],
      );
      policyIds[p.type] = res.rows[0].id;
    }

    // Coverage gaps (linked to policies)
    const gaps = [
      {
        policyType: 'renters',
        description:
          "Your renter's insurance personal property limit is $10,000, but your tracked assets total approximately $15,000. You are under-insured by ~$5,000.",
        severity: 'high',
        recommendation:
          'Increase personal property coverage to at least $20,000 or add a scheduled personal property endorsement.',
      },
      {
        policyType: 'auto',
        description:
          'Your auto insurance collision limit of $50,000 exceeds your vehicle value of $22,000. You are well covered.',
        severity: 'low',
        recommendation:
          'No action needed. Consider reducing collision coverage after vehicle depreciation to save on premiums.',
      },
      {
        policyType: 'renters',
        description:
          "Your renter's insurance explicitly excludes flood damage. Consider a separate flood insurance policy if you are in a risk zone.",
        severity: 'medium',
        recommendation:
          'Purchase NFIP flood insurance (~$30/mo) if your area has any flood risk.',
      },
      {
        policyType: 'health',
        description:
          'Your health plan covers emergency, preventive, and mental health. Consider adding a dental/vision rider.',
        severity: 'low',
        recommendation:
          'Add dental + vision plan (~$30/mo) to prevent surprise out-of-pocket costs.',
      },
    ];

    for (const g of gaps) {
      await polDb.query(
        `INSERT INTO policy_gaps
           (id, policy_id, description, severity, recommendation, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
        [policyIds[g.policyType], g.description, g.severity, g.recommendation],
      );
    }

    console.log('✓ Policies seeded (3 policies · 4 coverage gaps)');
  } finally {
    await polDb.end();
  }

  // ─── 4. AI SCENARIOS ───────────────────────────────────
  const aiDb = new Client({ connectionString: dbUrl('policylens_ai') });
  await aiDb.connect();

  try {
    await aiDb.query('DELETE FROM ai_scenarios WHERE user_id = $1', [userId]);

    const scenarios = [
      {
        query: 'What happens if I lose my job for 3 months?',
        scenarioType: 'income_shock',
        pathA: {
          title: 'Path A — Current Trajectory',
          narrative:
            'Currently, you earn $5,100/mo with $3,250/mo in fixed and variable expenses. Your savings account holds $8,500.',
          metrics: { savings: '$1,850/mo', runway: '4.7 months', riskLevel: 'Moderate' },
        },
        pathB: {
          title: 'Path B — 3-Month Job Loss',
          narrative:
            'If you lose your income for 3 months, your essential expenses ($3,250/mo × 3 = $9,750) would exceed your current savings of $8,500 by $1,250. You would need to either reduce spending by ~$420/mo or access your investment portfolio.',
          metrics: { savings: '-$1,250 (deficit)', runway: '2.6 months', riskLevel: 'High' },
        },
        delta: { savingsImpact: -9750, runwayChange: -2.1 },
        narrative:
          'Increase your emergency fund target to cover 6 months of expenses ($19,500). Consider an income-protection or short-term disability insurance policy (~$40/mo).',
        confidence: 'high',
      },
      {
        query: 'What if my car is totaled in an accident?',
        scenarioType: 'property',
        pathA: {
          title: 'Path A — Current Coverage',
          narrative:
            'Your auto insurance covers collision damage up to $50,000 with comprehensive coverage. Your Honda Civic 2022 is valued at $22,000.',
          metrics: { coveredAmount: '$22,000', deductible: '$500', outOfPocket: '$500' },
        },
        pathB: {
          title: 'Path B — Car Totaled',
          narrative:
            'If your car is totaled, your insurance would pay out the actual cash value (~$22,000) minus your deductible ($500). You would receive approximately $21,500. However, you would need a replacement vehicle. A comparable car costs ~$23,000, leaving a gap of ~$1,500.',
          metrics: { payout: '$21,500', replacementCost: '$23,000', gap: '$1,500' },
        },
        delta: { insurancePayout: 21500, outOfPocket: 1500 },
        narrative:
          'Your auto coverage is solid. Consider adding gap insurance (~$20/year) if you have a loan balance exceeding the car\'s value.',
        confidence: 'high',
      },
      {
        query: 'What if I have a medical emergency?',
        scenarioType: 'medical',
        pathA: {
          title: 'Path A — Current Health Coverage',
          narrative:
            'Your Blue Cross health plan has a $1,500 deductible with $500,000 annual maximum. Emergency room visits have a $250 copay.',
          metrics: { deductible: '$1,500', maxOOP: '$6,500', annualMax: '$500,000' },
        },
        pathB: {
          title: 'Path B — Major Medical Event',
          narrative:
            'A major medical emergency (e.g., surgery + 3-day hospital stay) could cost $30,000-$50,000. After your $1,500 deductible, your plan covers 80% of costs. Your out-of-pocket maximum is $6,500. Worst case: you pay $6,500 from savings, reducing it to $2,000.',
          metrics: { totalCost: '~$40,000', youPay: '$6,500', savingsAfter: '$2,000' },
        },
        delta: { savingsImpact: -6500, healthCost: 40000 },
        narrative:
          'Your health coverage is strong with a reasonable out-of-pocket max. Consider an HSA to set aside pre-tax dollars for medical expenses.',
        confidence: 'medium',
      },
    ];

    for (const s of scenarios) {
      await aiDb.query(
        `INSERT INTO ai_scenarios
           (id, user_id, query, scenario_type, path_a, path_b, delta, narrative, confidence, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, NOW())`,
        [
          userId, s.query, s.scenarioType,
          JSON.stringify(s.pathA), JSON.stringify(s.pathB),
          JSON.stringify(s.delta), s.narrative, s.confidence,
        ],
      );
    }

    console.log('✓ AI scenarios seeded (3 saved scenarios)');
  } finally {
    await aiDb.end();
  }

  console.log('\n✅ Demo account ready!');
  console.log(`   Email:    ${DEMO.email}`);
  console.log(`   Password: ${DEMO.password}`);
  console.log(`   UserId:   ${userId}`);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
