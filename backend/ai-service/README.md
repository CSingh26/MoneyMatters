# AI Service — PolicyLens AI

Hosts four AI agents powered by the Anthropic SDK (`claude-sonnet-4-6`) for policy parsing, financial health analysis, multi-agent orchestration, and scenario simulation.

## Port

`3004`

## Prisma Schema

- `AiParseJob` — Tracks async PDF parse jobs (status, results)
- `AiScenario` — Persisted what-if scenario simulations

## Agents

### 1. Policy Parser
Extracts structured data from PDF policy text: provider, policy number, coverages, gaps, risk score.
- **Trigger**: Internal service call from policy-service (async, returns 202)
- **Auth**: `X-Internal-Service-Key`

### 2. Watchdog
Analyzes a user's complete financial profile and generates:
- Overall health score (0–100)
- Risk flags with severity levels
- Actionable recommendations
- 50/30/20 budget breakdown
- **Trigger**: User request or dashboard aggregation
- **Auth**: JWT

### 3. Orchestrator
Determines which agents to invoke for complex, multi-step queries. Coordinates between parser, watchdog, and simulator as needed.
- **Trigger**: Internal coordination

### 4. Scenario Simulator
Runs 12-month what-if projections comparing:
- **Path A**: Status quo (no changes)
- **Path B**: Proposed scenario (e.g. job change, major purchase)

Returns month-by-month projections, delta analysis, confidence level, and recommendations.
- **Trigger**: User request
- **Auth**: JWT

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/parse` | Service | Trigger async policy parse |
| GET | `/api/ai/parse/status/:policyId` | Service | Check parse job status |
| POST | `/api/ai/watchdog` | JWT | Run financial health analysis |
| POST | `/api/ai/scenario` | JWT | Create what-if simulation |
| GET | `/api/ai/scenarios` | JWT | List user scenarios |
| GET | `/api/ai/scenario/:id` | JWT | Get scenario details |

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Anthropic API key for claude-sonnet-4-6 |
| `JWT_ACCESS_SECRET` | For verifying user tokens |
| `INTERNAL_SERVICE_KEY` | For service-to-service auth |
| `POLICY_SERVICE_URL` | URL of the policy service |
