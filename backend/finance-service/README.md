# Finance Service — PolicyLens AI

The finance microservice for PolicyLens AI manages income, expenditures, savings, and financial health summaries. All routes are protected by JWT authentication — tokens are issued by the auth-service and verified using the shared JWT middleware. The service normalizes all monetary figures to monthly equivalents for consistent calculations.

## Setup

```bash
cd backend/finance-service
npm install
cp .env.example .env    # fill in your values (JWT_SECRET must match auth-service)
npm run dev              # starts with hot-reload via tsx
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3002` | Port the finance service listens on |
| `JWT_SECRET` | **Yes** | — | JWT signing key. **Must match auth-service.** Minimum 32 characters. |
| `CORS_ORIGINS` | No | `http://localhost:3000,http://localhost:8081` | Comma-separated allowed origins |

## Endpoints

All endpoints require `Authorization: Bearer <accessToken>` header.

| Method | Path | Description |
|---|---|---|
| `POST` | `/finance/income` | Set income profile |
| `GET` | `/finance/income` | Get income profile |
| `POST` | `/finance/expenditure/fixed` | Set fixed expenses |
| `POST` | `/finance/expenditure/variable` | Set variable expenses |
| `GET` | `/finance/expenditure` | Get all expenditures |
| `POST` | `/finance/savings` | Add a savings entry |
| `GET` | `/finance/savings` | Get all savings entries |
| `GET` | `/finance/summary` | Get full financial summary |
| `GET` | `/finance/goals` | Goals scaffold (coming soon) |
| `POST` | `/finance/goals` | Goals scaffold (coming soon) |
| `GET` | `/health` | Health check (no auth) |

## Example Requests

### Set Income

```bash
curl -X POST http://localhost:3002/finance/income \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "biweekly",
    "amount": 3500,
    "sources": [
      { "name": "Freelance", "amount": 1000, "frequency": "monthly" }
    ]
  }'
```

**Response (201):**
```json
{
  "totalMonthlyIncome": 8583.33,
  "breakdown": [
    { "name": "Primary Income", "monthly": 7583.33 },
    { "name": "Freelance", "monthly": 1000 }
  ]
}
```

### Set Fixed Expenditure

```bash
curl -X POST http://localhost:3002/finance/expenditure/fixed \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "category": "rent", "name": "Apartment", "amount": 2000, "frequency": "monthly" },
      { "category": "car_loan", "name": "Honda Civic", "amount": 450, "frequency": "monthly" }
    ]
  }'
```

**Response (201):**
```json
{
  "totalFixed": 2450,
  "items": [
    { "category": "rent", "name": "Apartment", "amount": 2000, "frequency": "monthly", "monthlyAmount": 2000 },
    { "category": "car_loan", "name": "Honda Civic", "amount": 450, "frequency": "monthly", "monthlyAmount": 450 }
  ],
  "categoryBreakdown": { "rent": 2000, "car_loan": 450 }
}
```

### Add Savings Entry

```bash
curl -X POST http://localhost:3002/finance/savings \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentBalance": 15000,
    "type": "liquid_savings",
    "monthlySavingsAmount": 500,
    "description": "Emergency fund at Ally Bank"
  }'
```

### Get Financial Summary

```bash
curl http://localhost:3002/finance/summary \
  -H "Authorization: Bearer <accessToken>"
```

**Response (200):**
```json
{
  "totalMonthlyIncome": 8583.33,
  "totalMonthlyExpenditure": 3200,
  "totalMonthlySavings": 500,
  "disposableIncome": 4883.33,
  "savingsRate": 5.83,
  "expenseRatio": 37.28,
  "runway": 4.69,
  "breakdown": {
    "housingCosts": 2000,
    "debtPayments": 450,
    "livingExpenses": 750,
    "savings": 500
  },
  "healthIndicators": {
    "savingsRateStatus": "low",
    "debtToIncomeRatio": 5.24,
    "emergencyFundMonths": 4.69,
    "emergencyFundStatus": "adequate"
  }
}
```

## Cross-Service Authentication

This service **does not issue tokens** — it only verifies them. The JWT secret must match the auth-service's `JWT_SECRET`. The shared verification middleware lives at `backend/shared/middleware/auth.ts` and is imported as `createAuthMiddleware(jwtSecret)`.

User identity is always derived from the verified JWT payload (`req.user.sub`), never from the request body.
