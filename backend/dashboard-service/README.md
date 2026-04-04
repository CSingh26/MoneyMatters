# Dashboard Service — PolicyLens AI

BFF (Backend-for-Frontend) aggregator that fetches data from all four backend services in parallel and returns a unified dashboard payload.

## Port

`3005`

## Database

None — this service has no Prisma schema. It only proxies requests.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | JWT | Returns aggregated data from all services |

## Response Shape

```json
{
  "profile": { /* from auth-service */ },
  "finance": { /* from finance-service summary */ },
  "policies": [ /* from policy-service */ ],
  "watchdog": { /* from ai-service */ }
}
```

## Behavior

- Fetches from auth, finance, policy, and AI services **in parallel** using `Promise.allSettled`
- **Graceful degradation** — if any upstream service is unavailable, that section returns `null` instead of failing the entire request
- Automatically triggers a Watchdog analysis if finance data is available
- Forwards the user's JWT to upstream services

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `JWT_ACCESS_SECRET` | For verifying user tokens |
| `AUTH_SERVICE_URL` | URL of auth service (e.g. `http://localhost:3001`) |
| `FINANCE_SERVICE_URL` | URL of finance service |
| `POLICY_SERVICE_URL` | URL of policy service |
| `AI_SERVICE_URL` | URL of AI service |
| `INTERNAL_SERVICE_KEY` | For inter-service requests |
