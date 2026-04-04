# Auth Service — PolicyLens AI

The authentication microservice for PolicyLens AI handles user registration, login, JWT token management, and user profile retrieval. It provides stateless JWT-based authentication with access tokens (15min) and refresh tokens (7d) that are shared across all PolicyLens services via a common JWT secret.

## Setup

```bash
cd backend/auth-service
npm install
cp .env.example .env    # fill in your values
npm run dev              # starts with hot-reload via tsx
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3001` | Port the auth service listens on |
| `JWT_SECRET` | **Yes** | — | Signing key for JWT tokens. **Minimum 32 characters.** Must match the finance-service secret. |
| `JWT_ACCESS_EXPIRY` | No | `15m` | Access token lifetime (e.g. `15m`, `1h`) |
| `JWT_REFRESH_EXPIRY` | No | `7d` | Refresh token lifetime (e.g. `7d`, `30d`) |
| `CORS_ORIGINS` | No | `http://localhost:3000,http://localhost:8081` | Comma-separated allowed origins |
| `BCRYPT_SALT_ROUNDS` | No | `12` | bcrypt cost factor for password hashing |

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login and receive JWT tokens |
| `POST` | `/auth/refresh` | No | Exchange refresh token for new access token |
| `GET` | `/auth/me` | Bearer | Get current user profile |
| `GET` | `/health` | No | Health check |

### Rate Limits

- `POST /auth/register` — max **10 requests per 15 minutes** per IP
- `POST /auth/login` — max **5 requests per 15 minutes** per IP

## Example Requests

### Register

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "age": 30,
    "gender": "female",
    "email": "jane@example.com",
    "password": "MyP@ssw0rd!",
    "confirmPassword": "MyP@ssw0rd!"
  }'
```

**Response (201):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "firstName": "Jane",
  "lastName": "Doe",
  "age": 30,
  "gender": "female",
  "email": "jane@example.com",
  "createdAt": "2026-04-04T12:00:00.000Z"
}
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "MyP@ssw0rd!"
  }'
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "firstName": "Jane",
    "email": "jane@example.com"
  }
}
```

### Refresh Token

```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." }'
```

**Response (200):**
```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIs..." }
```

### Get Profile

```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## Cross-Service Authentication

The auth-service issues JWTs that the finance-service verifies. Both services **must share the same `JWT_SECRET`**. The shared verification middleware lives at `backend/shared/middleware/auth.ts`.
