// ─── Mock Data for PolicyLens AI ───

export const userData = {
  name: 'Harsh',
  email: 'user@policylens.ai',
  password: 'password123',
  avatar: 'H',
};

// ─── Financial Summary ───
export const financialSummary = {
  totalBalance: 15200,
  monthlyIncome: 5100,
  monthlyExpenses: 3250,
  savingsRate: 25,
};

// ─── Monthly Income vs Expenses (12 months) ───
export const monthlyData = [
  { month: 'Apr', income: 4600, expenses: 2900 },
  { month: 'May', income: 4700, expenses: 3050 },
  { month: 'Jun', income: 4850, expenses: 3200 },
  { month: 'Jul', income: 4750, expenses: 2800 },
  { month: 'Aug', income: 4900, expenses: 3100 },
  { month: 'Sep', income: 5000, expenses: 3300 },
  { month: 'Oct', income: 4800, expenses: 3100 },
  { month: 'Nov', income: 5000, expenses: 3400 },
  { month: 'Dec', income: 5200, expenses: 3800 },
  { month: 'Jan', income: 4900, expenses: 3000 },
  { month: 'Feb', income: 5100, expenses: 3200 },
  { month: 'Mar', income: 5100, expenses: 3250 },
];

// ─── Yearly Data (5 years) ───
export const yearlyData = [
  { year: '2021', income: 48000, expenses: 36000 },
  { year: '2022', income: 52000, expenses: 38000 },
  { year: '2023', income: 55000, expenses: 40000 },
  { year: '2024', income: 58000, expenses: 39000 },
  { year: '2025', income: 60600, expenses: 38400 },
];

// ─── Spending Categories ───
export const spendingByCategory = [
  { name: 'Mortgage', value: 1200, type: 'Fixed', color: '#6C5CE7' },
  { name: 'Loan', value: 400, type: 'Fixed', color: '#A29BFE' },
  { name: 'Insurance', value: 350, type: 'Fixed', color: '#74B9FF' },
  { name: 'Food', value: 500, type: 'Variable', color: '#00B894' },
  { name: 'Shopping', value: 450, type: 'Variable', color: '#FDCB6E' },
  { name: 'Transport', value: 350, type: 'Variable', color: '#FF7675' },
];

// ─── Transactions ───
export const transactions = [
  { id: 1, type: 'Expense', category: 'Food', amount: 45.50, date: '2025-03-28', description: 'Grocery Store' },
  { id: 2, type: 'Expense', category: 'Transport', amount: 35.00, date: '2025-03-27', description: 'Gas Station' },
  { id: 3, type: 'Income', category: 'Salary', amount: 5100.00, date: '2025-03-25', description: 'Monthly Salary' },
  { id: 4, type: 'Expense', category: 'Shopping', amount: 129.99, date: '2025-03-24', description: 'Electronics Store' },
  { id: 5, type: 'Expense', category: 'Mortgage', amount: 1200.00, date: '2025-03-23', description: 'Monthly Mortgage' },
  { id: 6, type: 'Expense', category: 'Insurance', amount: 175.00, date: '2025-03-22', description: 'Auto Insurance' },
  { id: 7, type: 'Expense', category: 'Food', amount: 62.30, date: '2025-03-21', description: 'Restaurant' },
  { id: 8, type: 'Expense', category: 'Loan', amount: 400.00, date: '2025-03-20', description: 'Student Loan' },
  { id: 9, type: 'Income', category: 'Freelance', amount: 800.00, date: '2025-03-18', description: 'Web Design Project' },
  { id: 10, type: 'Expense', category: 'Transport', amount: 55.00, date: '2025-03-17', description: 'Uber Rides' },
  { id: 11, type: 'Expense', category: 'Shopping', amount: 89.99, date: '2025-03-16', description: 'Clothing Store' },
  { id: 12, type: 'Expense', category: 'Food', amount: 28.75, date: '2025-03-15', description: 'Coffee & Snacks' },
  { id: 13, type: 'Expense', category: 'Insurance', amount: 175.00, date: '2025-03-14', description: 'Renters Insurance' },
  { id: 14, type: 'Expense', category: 'Food', amount: 95.40, date: '2025-03-12', description: 'Weekly Groceries' },
  { id: 15, type: 'Expense', category: 'Transport', amount: 40.00, date: '2025-03-10', description: 'Metro Pass' },
];

// ─── Assets ───
export const assets = [
  { id: 1, name: 'Honda Civic 2022', value: 22000, category: 'Vehicle', icon: 'car' },
  { id: 2, name: 'Savings Account', value: 8500, category: 'Cash', icon: 'piggyBank' },
  { id: 3, name: 'MacBook Pro 16"', value: 2499, category: 'Electronics', icon: 'laptop' },
  { id: 4, name: 'Investment Portfolio', value: 12000, category: 'Investments', icon: 'trendingUp' },
  { id: 5, name: 'Furniture & Appliances', value: 5000, category: 'Personal Property', icon: 'home' },
];

// ─── Savings Goal ───
export const savingsGoal = {
  name: 'Emergency Fund',
  target: 15000,
  current: 8500,
  deadline: '2025-12-31',
};

// ─── Insurance Policies ───
export const policies = [
  {
    id: 1,
    name: 'Auto Insurance',
    provider: 'StateFarm',
    premium: 175,
    premiumFrequency: 'monthly',
    coverageScore: 'Well Covered',
    scoreColor: 'green',
    expiresAt: '2026-01-15',
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
  {
    id: 2,
    name: "Renter's Insurance",
    provider: 'Lemonade',
    premium: 25,
    premiumFrequency: 'monthly',
    coverageScore: 'Gaps Found',
    scoreColor: 'orange',
    expiresAt: '2025-09-30',
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
  {
    id: 3,
    name: 'Health Insurance',
    provider: 'Blue Cross',
    premium: 280,
    premiumFrequency: 'monthly',
    coverageScore: 'Well Covered',
    scoreColor: 'green',
    expiresAt: '2025-12-31',
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
];

// ─── Gap Analysis ───
export const gapAnalysis = [
  {
    type: 'warning',
    title: 'Personal Property Gap',
    message: "Your renter's insurance personal property limit is $10,000, but your tracked assets total approximately $15,000. You are under-insured by ~$5,000.",
    severity: 'high',
  },
  {
    type: 'info',
    title: 'Auto Coverage Adequate',
    message: 'Your auto insurance collision limit of $50,000 exceeds your vehicle value of $22,000. You are well covered.',
    severity: 'low',
  },
  {
    type: 'warning',
    title: 'No Flood Coverage',
    message: "Your renter's insurance explicitly excludes flood damage. Consider a separate flood insurance policy if you are in a risk zone.",
    severity: 'medium',
  },
  {
    type: 'info',
    title: 'Health Coverage Strong',
    message: 'Your health plan covers emergency, preventive, and mental health. Consider adding a dental/vision rider.',
    severity: 'low',
  },
];

// ─── Scenario Responses ───
export const scenarioResponses = {
  default: {
    query: '',
    pathA: {
      title: 'Path A — Current Trajectory',
      narrative: 'With your current income of $5,100/mo, expenses of $3,250/mo, and savings rate of 25%, you are on track to reach your emergency fund goal of $15,000 by December 2025. Your total asset coverage is adequate for auto but has a gap in renter\'s insurance.',
      metrics: { savings: '$1,850/mo', runway: '4.7 months', riskLevel: 'Moderate' },
    },
    pathB: {
      title: 'Path B — Simulated Scenario',
      narrative: '',
      metrics: {},
    },
    recommendation: '',
  },
  jobLoss: {
    query: 'What happens if I lose my job for 3 months?',
    pathA: {
      title: 'Path A — Current Trajectory',
      narrative: 'Currently, you earn $5,100/mo with $3,250/mo in fixed and variable expenses. Your savings account holds $8,500.',
      metrics: { savings: '$1,850/mo', runway: '4.7 months', riskLevel: 'Moderate' },
    },
    pathB: {
      title: 'Path B — 3-Month Job Loss',
      narrative: 'If you lose your income for 3 months, your essential expenses ($3,250/mo × 3 = $9,750) would exceed your current savings of $8,500 by $1,250. You would need to either reduce spending by ~$420/mo or access your investment portfolio.',
      metrics: { savings: '-$1,250 (deficit)', runway: '2.6 months', riskLevel: 'High' },
    },
    recommendation: '💡 Recommendation: Increase your emergency fund target to cover 6 months of expenses ($19,500). Consider an income-protection or short-term disability insurance policy (~$40/mo) to bridge income gaps. Temporarily reducing variable spending (food, shopping) by 30% would extend your runway to 3.4 months.',
  },
  carAccident: {
    query: 'What if my car is totaled in an accident?',
    pathA: {
      title: 'Path A — Current Coverage',
      narrative: 'Your auto insurance covers collision damage up to $50,000 with comprehensive coverage. Your Honda Civic 2022 is valued at $22,000.',
      metrics: { coveredAmount: '$22,000', deductible: '$500', outOfPocket: '$500' },
    },
    pathB: {
      title: 'Path B — Car Totaled',
      narrative: 'If your car is totaled, your insurance would pay out the actual cash value (~$22,000) minus your deductible ($500). You would receive approximately $21,500. However, you would need a replacement vehicle. A comparable car costs ~$23,000, leaving a gap of ~$1,500.',
      metrics: { payout: '$21,500', replacementCost: '$23,000', gap: '$1,500' },
    },
    recommendation: '💡 Recommendation: Your auto coverage is solid. Consider adding gap insurance (~$20/year) if you have a loan balance exceeding the car\'s value. Set aside $2,000 in your emergency fund specifically for vehicle-related emergencies.',
  },
  medicalEmergency: {
    query: 'What if I have a medical emergency?',
    pathA: {
      title: 'Path A — Current Health Coverage',
      narrative: 'Your Blue Cross health plan has a $1,500 deductible with $500,000 annual maximum. Emergency room visits have a $250 copay. You have no dental/vision coverage.',
      metrics: { deductible: '$1,500', maxOOP: '$6,500', annualMax: '$500,000' },
    },
    pathB: {
      title: 'Path B — Major Medical Event',
      narrative: 'A major medical emergency (e.g., surgery + 3-day hospital stay) could cost $30,000-$50,000. After your $1,500 deductible, your plan covers 80% of costs. Your out-of-pocket maximum is $6,500. Worst case: you pay $6,500 from savings, reducing it to $2,000.',
      metrics: { totalCost: '~$40,000', youPay: '$6,500', savingsAfter: '$2,000' },
    },
    recommendation: '💡 Recommendation: Your health coverage is strong with a reasonable out-of-pocket max. However, $6,500 in medical costs would significantly impact your $8,500 savings. Consider an HSA (Health Savings Account) to set aside pre-tax dollars for medical expenses. Also, adding dental/vision coverage (~$30/mo) would prevent surprise costs.',
  },
};

// Helper to match scenario
export function getScenarioResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('job') || q.includes('lose') || q.includes('unemploy') || q.includes('laid off')) {
    return scenarioResponses.jobLoss;
  }
  if (q.includes('car') || q.includes('accident') || q.includes('total') || q.includes('crash')) {
    return scenarioResponses.carAccident;
  }
  if (q.includes('medical') || q.includes('hospital') || q.includes('emergency') || q.includes('health') || q.includes('surgery')) {
    return scenarioResponses.medicalEmergency;
  }
  // Default: generic response
  return {
    ...scenarioResponses.default,
    pathB: {
      title: 'Path B — Simulated Scenario',
      narrative: `Based on your question "${query}", here's what our analysis shows: Your current financial position includes $8,500 in liquid savings, $12,000 in investments, and monthly surplus of $1,850. Any disruption under $5,500 can be absorbed without lifestyle changes. Larger disruptions would require tapping into investments or adjusting spending.`,
      metrics: { savings: '$8,500', investments: '$12,000', monthlyBuffer: '$1,850' },
    },
    recommendation: '💡 Recommendation: Maintain your current savings trajectory. Consider diversifying your insurance portfolio to cover additional scenarios. Review your coverage annually to ensure it keeps pace with asset growth.',
  };
}
