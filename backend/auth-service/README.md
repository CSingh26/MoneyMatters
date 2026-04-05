# Auth Service — PolicyLens AI

Handles user registration, login, JWT token management (access + refresh with rotation), and profile CRUD.

## Port

`3001`

## Prisma Schema

- `AuthUser` — User accounts with encrypted last names
- `AuthRefreshToken` — Refresh token family tracking for reuse detection

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register with email, password, first/last name, DOB, gender |
| POST | `/api/auth/login` | — | Returns access + refresh token pair |
| POST | `/api/auth/refresh` | — | Rotates refresh token (reuse detection revokes family) |
| GET | `/api/auth/profile` | JWT | Returns decrypted user profile |
| PATCH | `/api/auth/profile` | JWT | Update profile fields |
| POST | `/api/auth/logout` | JWT | Revokes all refresh tokens |
| DELETE | `/api/auth/account` | JWT | Soft-deactivate account |

## Security

- **bcrypt** — 12 salt rounds for password hashing
- **JWT** — Access token (15 min), refresh token (7 days), separate secrets
- **Refresh rotation** — Token reuse triggers full family revocation
- **Field encryption** — Last name encrypted with AES-256-GCM
- **Rate limiting** — Registration and login are rate-limited
- **Zod validation** — Password: min 8 chars, upper + lower + digit + special

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`) |
| `ENCRYPTION_KEY` | 32-char hex key for AES-256-GCM |
| `PORT` | Service port (default 3001) |
