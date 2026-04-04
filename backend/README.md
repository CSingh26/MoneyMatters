# PolicyLens AI — Backend Architecture

A production-grade Node.js + TypeScript microservice architecture with PostgreSQL via Prisma ORM, four AI agents powered by the Anthropic SDK, field-level encryption, and inter-service authentication.

## Architecture Overview

```
┌─────────────┐  ┌──────────────────┐  ┌────────────────┐
│  Frontend    │──│  Dashboard :3005 │──│  Auth :3001    │
│  (React)     │  │  (Aggregator)    │  │  (JWT+bcrypt)  │
└─────────────┘  └──────┬───────────┘  └────────────────┘
                        │
              ┌─────────┼─────────┐
              │         │         │
       ┌──────┴───┐ ┌───┴──────┐ ┌┴──────────┐
       │ Finance  │ │ Policy   │ │ AI        │
       │ :3002    │ │ :3003    │ │ :3004     │
       │ (CRUD+   │ │ (Upload+ │ │ (4 Agents)│
       │  encrypt) │ │  parse)  │ │           │
       └──────────┘ └──────────┘ └───────────┘
              │         │              │
              └─────────┴──────────────┘
                        │
                  ┌─────┴─────┐
                  │ PostgreSQL │
                  │ (shared)   │
                  └───────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| **auth-service** | 3001 | Registration, login, JWT access/refresh tokens, profile CRUD |
| **finance-service** | 3002 | Income, expenditure, savings, goals CRUD with encrypted PII |
| **policy-service** | 3003 | PDF policy upload, parsing, gap analysis |
| **ai-service** | 3004 | 4 AI agents: Policy Parser, Watchdog, Orchestrator, Scenario Simulator |
| **dashboard-service** | 3005 | Aggregator — parallel data fetch from all services |

## Shared Module (`backend/shared/`)

Reusable code imported by all services:

- **types/index.ts** — TypeScript enums and interfaces
- **middleware/auth.ts** — JWT Bearer token verification
- **middleware/errorHandler.ts** — Global Express error handler (Zod-aware)
- **middleware/rateLimiter.ts** — Configurable rate limiter factory
- **middleware/serviceAuth.ts** — Inter-service key verification (timing-safe)
- **utils/jwt.ts** — Sign/verify helpers for access and refresh tokens
- **utils/crypto.ts** — AES-256-GCM field-level encrypt/decrypt
- **utils/logger.ts** — Structured JSON logger
- **utils/response.ts** — Standardized `sendSuccess`/`sendError` helpers

## AI Agents

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **Policy Parser** | Extracts structured data from PDF policy text | Service-to-service (async) |
| **Watchdog** | Analyzes financial health, generates risk flags + recommendations | User request or dashboard |
| **Orchestrator** | Determines which agents to invoke for complex queries | Internal coordination |
| **Scenario Simulator** | 12-month what-if projections with Path A/B comparison | User request |

All agents use the Anthropic SDK with `claude-sonnet-4-6`.

## Security

- **JWT Authentication**: Access tokens (15 min) + refresh tokens (7 days) with rotation and reuse detection
- **Password Hashing**: bcrypt with 12 salt rounds
- **Field-Level Encryption**: AES-256-GCM for financial PII (amounts, balances, last names)
- **Inter-Service Auth**: `X-Internal-Service-Key` header with `crypto.timingSafeEqual`
- **Rate Limiting**: Configurable per-service via environment variables
- **Input Validation**: Zod schemas on all endpoints
- **Security Headers**: Helmet middleware on all services

## Database

Single PostgreSQL instance with table prefixes per service:

- `auth_users`, `auth_refresh_tokens`
- `finance_profiles`, `finance_income_items`, `finance_fixed_expenditures`, `finance_variable_expenditures`, `finance_savings_items`, `finance_goals`
- `policy_documents`, `policy_gaps`
- `ai_scenarios`, `ai_parse_jobs`

## Getting Started

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 15+
- Anthropic API key (for AI agents)

### Setup

```bash
# 1. Clone and switch to backend branch
git clone git@github.com:CSingh26/MoneyMatters.git
cd MoneyMatters
git checkout backend

# 2. Install dependencies for each service
for dir in shared auth-service finance-service policy-service ai-service dashboard-service; do
  cd backend/$dir && npm install && cd ../..
done

# 3. Configure environment variables
# Copy .env.example to .env in each service and update values
for dir in auth-service finance-service policy-service ai-service dashboard-service; do
  cp backend/$dir/.env.example backend/$dir/.env
done

# 4. Generate Prisma clients and run migrations
for dir in auth-service finance-service policy-service ai-service; do
  cd backend/$dir && npx prisma generate && npx prisma migrate dev && cd ../..
done

# 5. Start services (each in a separate terminal)
cd backend/auth-service && npm run dev
cd backend/finance-service && npm run dev
cd backend/policy-service && npm run dev
cd backend/ai-service && npm run dev
cd backend/dashboard-service && npm run dev
```

### Environment Variables

Each service has a `.env.example` file. Key variables:

| Variable | Required By | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | auth, finance, policy, ai | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | all services | JWT signing secret (64+ chars) |
| `JWT_REFRESH_SECRET` | auth | Refresh token signing secret |
| `ENCRYPTION_KEY` | auth, finance | 32-char hex string for AES-256-GCM |
| `INTERNAL_SERVICE_KEY` | all services | Inter-service API key |
| `ANTHROPIC_API_KEY` | ai | Anthropic SDK API key |

## API Endpoints

### Auth Service (`:3001`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | - | Register new user |
| POST | `/api/auth/login` | - | Login |
| POST | `/api/auth/refresh` | - | Refresh token pair |
| GET | `/api/auth/profile` | JWT | Get profile |
| PATCH | `/api/auth/profile` | JWT | Update profile |
| POST | `/api/auth/logout` | JWT | Logout (revoke tokens) |
| DELETE | `/api/auth/account` | JWT | Deactivate account |

### Finance Service (`:3002`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/finance/income` | JWT | Add income |
| PATCH | `/api/finance/income/:id` | JWT | Update income |
| DELETE | `/api/finance/income/:id` | JWT | Delete income |
| POST | `/api/finance/expenditure/fixed` | JWT | Add fixed expense |
| PATCH | `/api/finance/expenditure/fixed/:id` | JWT | Update fixed expense |
| DELETE | `/api/finance/expenditure/fixed/:id` | JWT | Delete fixed expense |
| POST | `/api/finance/expenditure/variable` | JWT | Add variable expense |
| PATCH | `/api/finance/expenditure/variable/:id` | JWT | Update variable expense |
| DELETE | `/api/finance/expenditure/variable/:id` | JWT | Delete variable expense |
| POST | `/api/finance/savings` | JWT | Add savings |
| PATCH | `/api/finance/savings/:id` | JWT | Update savings |
| DELETE | `/api/finance/savings/:id` | JWT | Delete savings |
| POST | `/api/finance/goals` | JWT | Create goal |
| PATCH | `/api/finance/goals/:id` | JWT | Update goal |
| DELETE | `/api/finance/goals/:id` | JWT | Delete goal |
| GET | `/api/finance/summary` | JWT | Get financial summary |

### Policy Service (`:3003`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/policies` | JWT | Upload PDF policy |
| GET | `/api/policies` | JWT | List user policies |
| GET | `/api/policies/:id` | JWT | Get policy details |
| DELETE | `/api/policies/:id` | JWT | Delete policy |

### AI Service (`:3004`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/parse` | Service | Parse policy PDF (internal) |
| GET | `/api/ai/parse/status/:policyId` | Service | Check parse status |
| POST | `/api/ai/watchdog` | JWT | Financial health analysis |
| POST | `/api/ai/scenario` | JWT | Run what-if simulation |
| GET | `/api/ai/scenarios` | JWT | List user scenarios |
| GET | `/api/ai/scenario/:id` | JWT | Get scenario details |

### Dashboard Service (`:3005`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | JWT | Aggregated dashboard data |
