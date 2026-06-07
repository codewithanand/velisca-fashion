# Velisca Fashion API — Documentation

> Backend API documentation for the Velisca luxury boutique web application.

---

## Architecture Overview

Built with:
- **Laravel 12** — PHP framework
- **Laravel Sanctum** — API token authentication
- **MySQL** — Database
- **RESTful JSON APIs** — Communication layer

Pattern: **Service Layer** — Controllers are thin, business logic lives in services.

---

## Modules

| Module | Description | Status |
|--------|-------------|--------|
| [Auth](./modules/auth.md) | Register, login, logout, token refresh, password reset | Done |
| — | — | — |
| *More modules coming soon* | | |

---

## Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": {}
}
```

---

## Authentication Strategy

| Token | Type | Expiry | Storage |
|-------|------|--------|---------|
| Access Token | Sanctum plain text token | 15 minutes | Frontend memory (React state) |
| Refresh Token | Random 128-char string (SHA-256 hashed in DB) | 30 days | `localStorage` or httpOnly cookie |

### Flow

1. User logs in → receives `access_token` + `refresh_token`
2. Frontend stores access token in React state, refresh token in `localStorage`
3. Every API request includes `Authorization: Bearer <access_token>`
4. When access token expires (401), frontend calls `/auth/refresh`
5. Backend validates refresh token, rotates it, issues new pair
6. If refresh fails → user must log in again

### No CSRF Required

This is a **pure stateless API** using Bearer tokens. No sessions, no cookies, no CSRF tokens.

- `statefulApi()` middleware is disabled
- `ValidateCsrfToken` middleware is disabled
- `withCredentials` is `false` in CORS
- Frontend does NOT call `/sanctum/csrf-cookie`

---

## Swagger UI

Interactive API documentation is available at:

```
http://localhost:8000/api/documentation
```

To regenerate the docs after changes:

```bash
php artisan l5-swagger:generate
```

---

## CORS

Controlled via `.env`:

```
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

- In dev: include your Vite dev server URL
- In production: set to your actual frontend domain only (e.g., `https://velisca.com`)
- No cookies, no `withCredentials` — pure Bearer token auth

---

## Base URL

```
http://localhost:8000/api
```

---

## Code Structure

```
app/
├── Http/
│   ├── Controllers/API/Auth/     # Auth controllers
│   ├── Requests/Auth/            # Form request validators
│   └── Resources/                # API resource transformers
├── Services/Auth/                # Business logic layer
├── Traits/                       # Reusable traits (ApiResponseTrait)
└── Models/                       # Eloquent models
routes/
└── api.php                       # API route definitions
docs/
├── README.md                     # This file
└── modules/                      # Per-module documentation
```
