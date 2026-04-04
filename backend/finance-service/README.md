# Finance Service — PolicyLens AI

Manages income, expenditure (fixed + variable), savings, and financial goals with encrypted monetary values and a health-score algorithm.

## Port

`3002`

## Prisma Schema

- `FinanceProfile` — Per-user finance container (auto-created)
- `FinanceIncomeItem` — Income sources with frequency normalization
- `FinanceFixedExpenditure` — 9 categories (housing, utilities, insurance, etc.)
- `FinanceVariableExpenditure` — 8 categories (groceries, dining, entertainment, etc.)
- `FinanceSavingsItem` — 8 types (emergency, retirement, investment, etc.)
- `FinanceGoal` — Financial goals with target amounts and deadlines

## Endpoints

All require JWT authentication.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/finance/income` | Add income source |
| PATCH | `/api/finance/income/:id` | Update income |
| DELETE | `/api/finance/income/:id` | Remove income |
| POST | `/api/finance/expenditure/fixed` | Add fixed expense |
| PATCH | `/api/finance/expenditure/fixed/:id` | Update fixed expense |
| DELETE | `/api/finance/expenditure/fixed/:id` | Remove fixed expense |
| POST | `/api/finance/expenditure/variable` | Add variable expense |
| PATCH | `/api/finance/expenditure/variable/:id` | Update variable expense |
| DELETE | `/api/finance/expenditure/variable/:id` | Remove variable expense |
| POST | `/api/finance/savings` | Add savings |
| PATCH | `/api/finance/savings/:id` | Update savings |
| DELETE | `/api/finance/savings/:id` | Remove savings |
| POST | `/api/finance/goals` | Create goal |
| PATCH | `/api/finance/goals/:id` | Update goal |
| DELETE | `/api/finance/goals/:id` | Delete goal |
| GET | `/api/finance/summary` | Full financial summary with health score |

## Health Score Algorithm

The summary endpoint computes a 0–100 health score:

- **Expense Ratio** (40 pts) — Monthly expenses ÷ monthly income
- **Savings Rate** (35 pts) — Monthly savings ÷ monthly income
- **Emergency Fund** (25 pts) — Emergency savings ÷ (6 × monthly expenses)

## Security

- **Field encryption** — All monetary amounts encrypted at rest with AES-256-GCM
- **Frequency normalization** — Biweekly/annual amounts normalized to monthly for calculations
- **Ownership checks** — Users can only access their own financial data

## Environment Variables

See `.env.example` for all required variables.
