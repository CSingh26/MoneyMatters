# Policy Service — PolicyLens AI

Handles insurance/financial policy PDF uploads, storage, and triggers AI-powered parsing for coverage extraction and gap analysis.

## Port

`3003`

## Prisma Schema

- `Policy` — Policy documents with type, file path, parsed data, renewal date
- `PolicyGap` — Coverage gaps identified by the AI parser

## Endpoints

All require JWT authentication.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/policies` | Upload PDF policy (multipart/form-data) |
| GET | `/api/policies` | List user policies (filterable by type, parseStatus) |
| GET | `/api/policies/:id` | Get policy details + gaps |
| DELETE | `/api/policies/:id` | Delete policy and file |

## Upload Flow

1. User uploads PDF via multipart form
2. File saved to disk via multer (PDF-only, configurable max size)
3. Policy record created with `parseStatus: PENDING`
4. Async POST to AI service triggers background parsing
5. AI service calls back to update policy with parsed data + gaps

## Policy Types

`HEALTH`, `LIFE`, `AUTO`, `HOME`, `DISABILITY`, `LIABILITY`, `UMBRELLA`, `OTHER`

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | For verifying user tokens |
| `INTERNAL_SERVICE_KEY` | For AI service callbacks |
| `AI_SERVICE_URL` | URL of the AI service (e.g. `http://localhost:3004`) |
| `UPLOAD_DIR` | Directory for uploaded PDFs |
| `MAX_FILE_SIZE` | Max upload size in bytes |
