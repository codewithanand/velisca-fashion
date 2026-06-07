# Auth Module

> Handles user authentication: registration, login, logout, token refresh, password management, and **role-based access control**.

---

## Table of Contents

- [Endpoints](#endpoints)
- [Register](#1-register)
- [Login](#2-login)
- [Refresh Token](#3-refresh-token)
- [Logout](#4-logout)
- [Logout All Devices](#5-logout-all-devices)
- [Current User](#6-current-user)
- [Forgot Password](#7-forgot-password)
- [Reset Password](#8-reset-password)
- [Admin API](#9-admin-api)
- [Role-Based Access Control](#10-role-based-access-control)
- [Database Schema](#database-schema)
- [Code Structure](#code-structure)

---

## Endpoints

### Auth Endpoints

| Method | Endpoint | Auth | Throttle | Description |
|--------|----------|------|----------|-------------|
| POST | `/api/auth/register` | No | Yes | Register a new user (role: customer) |
| POST | `/api/auth/login` | No | Yes | Login (returns role in user object) |
| POST | `/api/auth/refresh` | No | Yes | Refresh access token |
| POST | `/api/auth/forgot-password` | No | Yes | Send password reset email |
| POST | `/api/auth/reset-password` | No | Yes | Reset password with token |
| GET | `/api/auth/me` | Yes | — | Get authenticated user |
| POST | `/api/auth/logout` | Yes | — | Logout (revoke current token) |
| POST | `/api/auth/logout-all` | Yes | — | Logout from all devices |

### Admin Endpoints (requires `auth:sanctum` + `role:admin,staff`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET/POST/PUT/DELETE | `/api/admin/products` | Product CRUD |
| GET/PUT | `/api/admin/orders` | Order management |
| GET/PUT | `/api/admin/orders/{id}/status` | Update order status |
| GET/PUT | `/api/admin/users` | User management |
| PUT | `/api/admin/users/{id}/toggle-block` | Block/unblock user |
| GET/POST/PUT/DELETE | `/api/admin/categories` | Category CRUD |
| GET/POST/PUT/DELETE | `/api/admin/coupons` | Coupon CRUD |
| GET/POST/PUT/DELETE | `/api/admin/banners` | Banner CRUD |
| PUT | `/api/admin/banners/{id}/toggle` | Toggle banner active state |
| GET | `/api/admin/analytics/*` | Analytics data |
| GET/POST/DELETE | `/api/admin/notifications` | Notifications |
| GET/PUT | `/api/admin/settings` | Store settings |

---

## 1. Register

### `POST /api/auth/register`

Create a new user account. Returns access token and refresh token.

### Request

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "1234567890",
  "password": "securePass1",
  "password_confirmation": "securePass1"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `name` | required, string, max:255 |
| `email` | required, email, unique:users |
| `phone` | required, string, digits:10 |
| `password` | required, string, min:8, confirmed |

### Response `201`

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "1234567890",
      "avatar": null,
      "role": "customer",
      "email_verified_at": null,
      "created_at": "2026-06-05T12:00:00.000000Z",
      "updated_at": "2026-06-05T12:00:00.000000Z"
    },
    "access_token": "1|abc123...sanctumToken",
    "refresh_token": "a1b2c3...128CharRandomString",
    "expires_in": 900
  }
}
```

---

## 2. Login

### `POST /api/auth/login`

Authenticate with email and password. Returns access token and refresh token.

### Request

```json
{
  "email": "jane@example.com",
  "password": "securePass1",
  "device_name": "Chrome on Windows"
}
```

`device_name` is optional but recommended for multi-device management.

### Validation Rules

| Field | Rules |
|-------|-------|
| `email` | required, email |
| `password` | required, string |
| `device_name` | sometimes, string, max:255 |

### Response `200`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "1234567890",
      "avatar": null,
      "role": "customer",
      "email_verified_at": null,
      "created_at": "2026-06-05T12:00:00.000000Z",
      "updated_at": "2026-06-05T12:00:00.000000Z"
    },
    "access_token": "1|abc123...sanctumToken",
    "refresh_token": "a1b2c3...128CharRandomString",
    "expires_in": 900
  }
}
```

> **Note:** The `role` field determines what the user can access. See [Role-Based Access Control](#10-role-based-access-control).

### Error `401`

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 3. Refresh Token

### `POST /api/auth/refresh`

Exchange a valid refresh token for a new access token + refresh token pair.

**Important:** Refresh tokens are rotated. Each refresh invalidates the previous refresh token. This prevents token replay attacks.

### Request

```json
{
  "refresh_token": "a1b2c3...128CharRandomString"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `refresh_token` | required, string |

### Response `200`

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "1234567890",
      "avatar": null,
      "role": "customer",
      "email_verified_at": null,
      "created_at": "2026-06-05T12:00:00.000000Z",
      "updated_at": "2026-06-05T12:00:00.000000Z"
    },
    "access_token": "2|newSanctumToken...",
    "refresh_token": "new128CharRandomString...",
    "expires_in": 900
  }
}
```

### Error `401`

```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

---

## 4. Logout

### `POST /api/auth/logout`

Revokes the current access token and its associated refresh token. Requires authentication.

### Headers

```
Authorization: Bearer 1|abc123...sanctumToken
```

### Response `200`

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 5. Logout All Devices

### `POST /api/auth/logout-all`

Revokes **all** tokens (access + refresh) for the authenticated user. Logs the user out from every device/session.

### Headers

```
Authorization: Bearer 1|abc123...sanctumToken
```

### Response `200`

```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

## 6. Current User

### `GET /api/auth/me`

Returns the authenticated user's profile.

### Headers

```
Authorization: Bearer 1|abc123...sanctumToken
```

### Response `200`

```json
{
  "success": true,
  "message": "Current user retrieved",
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "1234567890",
      "avatar": null,
      "role": "customer",
      "email_verified_at": null,
      "created_at": "2026-06-05T12:00:00.000000Z",
      "updated_at": "2026-06-05T12:00:00.000000Z"
    }
  }
}
```

---

## 7. Forgot Password

### `POST /api/auth/forgot-password`

Sends a password reset link to the user's email. The email contains a frontend URL with the reset token.

### Request

```json
{
  "email": "jane@example.com"
}
```

### Response `200`

```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

### Error `400` (e.g., email not found)

```json
{
  "success": false,
  "message": "We can't find a user with that email address."
}
```

---

## 8. Reset Password

### `POST /api/auth/reset-password`

Resets the user's password using the token received via email.

### Request

```json
{
  "email": "jane@example.com",
  "token": "resetTokenFromEmail",
  "password": "newSecurePass1",
  "password_confirmation": "newSecurePass1"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `email` | required, email |
| `token` | required, string |
| `password` | required, string, min:8, confirmed |

### Response `200`

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Error `400`

```json
{
  "success": false,
  "message": "This password reset token is invalid."
}
```

---

## 9. Admin API

### `POST /api/admin/login`

Admin/staff can log in using the same auth endpoint (or at `/api/admin/login`). The response includes the user's `role`.

### `GET /api/admin/me`

Returns the authenticated admin/staff user.

### Headers

```
Authorization: Bearer 1|abc123...sanctumToken
```

### Role Validation

The frontend checks that `user.role` is `admin` or `staff` before granting access. If a customer tries to log in via the admin panel, access is denied.

---

## 10. Role-Based Access Control

### User Roles

| Role | Constant | Description |
|------|----------|-------------|
| `admin` | `User::ROLE_ADMIN` | Full access to all admin features |
| `staff` | `User::ROLE_STAFF` | Limited access (no users, coupons, notifications, settings) |
| `customer` | `User::ROLE_CUSTOMER` | Default role for registered users, no admin access |

### Backend Implementation

#### User Model (`app/Models/User.php`)

```php
class User extends Authenticatable
{
    public const ROLE_ADMIN = 'admin';
    public const ROLE_STAFF = 'staff';
    public const ROLE_CUSTOMER = 'customer';

    // Helper methods
    public function isAdmin(): bool;
    public function isStaff(): bool;
    public function isCustomer(): bool;
    public function hasRole(string $role): bool;
    public function hasAnyRole(array $roles): bool;
}
```

#### CheckRole Middleware (`app/Http/Middleware/CheckRole.php`)

Applied to all `/api/admin/*` routes:

```php
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
    // ...
});
```

Returns **403 Forbidden** if the user's role is not in the allowed list.

### Frontend Implementation

#### Role Helpers (`AdminContext.jsx`)

| Function | Returns |
|----------|---------|
| `hasRole('admin')` | `true` if user is admin |
| `hasAnyRole(['admin', 'staff'])` | `true` if user is admin or staff |
| `isSuperAdmin()` | `true` if user is admin |

#### Sidebar Permissions

| Menu Item | Required Role |
|-----------|---------------|
| Dashboard, Products, Categories, Orders, Inventory, Banners, Analytics | `admin` or `staff` |
| Users, Coupons, Notifications, Settings | `admin` only |

### Seed Data

```bash
php artisan db:seed
```

Creates three default users:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@velisca.com` | `admin123` | `admin` |
| Staff | `staff@velisca.com` | `staff123` | `staff` |
| Test User | `test@example.com` | `password` | `customer` |

---

## Database Schema

### `users` table

| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(255) | required |
| email | varchar(255) | unique, required |
| phone | varchar(20) | nullable |
| email_verified_at | timestamp | nullable |
| password | varchar(255) | required (hashed) |
| avatar | varchar(255) | nullable |
| **role** | varchar(20) | default `'customer'`, values: `customer`, `staff`, `admin` |
| remember_token | varchar(100) | nullable |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

### `personal_access_tokens` table (Sanctum — customized)

| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| tokenable_type | varchar(255) | morphs |
| tokenable_id | bigint unsigned | morphs |
| name | varchar(255) | token name (device name) |
| token | varchar(64) | unique, SHA-256 hashed |
| abilities | text | nullable |
| **refresh_token** | varchar(128) | nullable, unique, indexed, SHA-256 hashed |
| **refresh_token_expires_at** | timestamp | nullable |
| **device_name** | varchar(255) | nullable |
| **ip_address** | varchar(45) | nullable |
| **user_agent** | text | nullable |
| last_used_at | timestamp | nullable |
| expires_at | timestamp | indexed, nullable |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

> **Bold** columns are custom additions beyond Sanctum's default schema.

---

## Code Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── API/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthController.php          # register, login, me, logout, logoutAll
│   │   │   │   ├── RefreshTokenController.php  # refresh
│   │   │   │   └── PasswordController.php      # forgot, reset
│   │   │   └── Admin/
│   │   │       ├── DashboardController.php     # Dashboard stats
│   │   │       ├── ProductController.php       # Product CRUD
│   │   │       ├── OrderController.php         # Order management
│   │   │       ├── UserController.php          # User management + toggle-block
│   │   │       ├── CategoryController.php      # Category CRUD
│   │   │       ├── CouponController.php        # Coupon CRUD
│   │   │       ├── BannerController.php        # Banner CRUD + toggle
│   │   │       ├── AnalyticsController.php     # Revenue, orders, users analytics
│   │   │       ├── NotificationController.php  # Notifications
│   │   │       └── SettingsController.php      # Store settings
│   │   └── Controller.php
│   │
│   ├── Middleware/
│   │   ├── ForceJsonResponse.php
│   │   └── CheckRole.php           # Role-based access control middleware
│   │
│   ├── Requests/Auth/
│   │   ├── RegisterRequest.php
│   │   ├── LoginRequest.php
│   │   ├── RefreshTokenRequest.php
│   │   ├── ForgotPasswordRequest.php
│   │   └── ResetPasswordRequest.php
│   │
│   └── Resources/
│       └── UserResource.php
│
├── Services/Auth/
│   ├── TokenService.php          # Access/refresh token creation, hashing, rotation, revocation
│   ├── AuthService.php           # Register, login, logout business logic
│   └── RefreshTokenService.php   # Refresh token validation and rotation
│
├── Traits/
│   └── ApiResponseTrait.php
│
└── Models/
    └── User.php                  # HasApiTokens, role constants, role helpers, sendPasswordResetNotification

app/Notifications/
└── PasswordResetNotification.php

app/Http/Middleware/
└── CheckRole.php                 # Gatekeeper for admin routes

routes/
└── api.php                       # Auth routes + 38 admin routes with role middleware
```

---

## Key Classes

### TokenService

`app/Services/Auth/TokenService.php`

Centralized token management:

| Method | Purpose |
|--------|---------|
| `createAccessToken($user, $deviceName, $abilities)` | Create a Sanctum token with 15-min expiry |
| `createRefreshToken()` | Generate 128-char random string |
| `hashRefreshToken($token)` | SHA-256 hash |
| `storeRefreshToken($token, $refreshToken)` | Save hashed refresh token + 30-day expiry |
| `rotateRefreshToken($token)` | Revoke old, generate new refresh token |
| `findTokenByRefreshToken($refreshToken)` | Look up by hashed refresh token |
| `revokeCurrentToken($token)` | Delete token |
| `revokeAllTokens($user)` | Delete all user tokens |
| `storeTokenMetadata($token, $deviceName, $ip, $userAgent)` | Save device info |

### AuthService

`app/Services/Auth/AuthService.php`

| Method | Purpose |
|--------|---------|
| `register($data)` | Create user + generate token pair |
| `login($data)` | Validate credentials + generate token pair |
| `logout($user, $tokenId)` | Revoke specific token |
| `logoutAllDevices($user)` | Revoke all tokens |

### RefreshTokenService

`app/Services/Auth/RefreshTokenService.php`

| Method | Purpose |
|--------|---------|
| `refresh($refreshToken)` | Validate expiry, rotate token, return new pair |

### User Model — Role Helpers

`app/Models/User.php`

| Method | Purpose |
|--------|---------|
| `isAdmin()` | Check if user has admin role |
| `isStaff()` | Check if user has staff role |
| `isCustomer()` | Check if user has customer role |
| `hasRole($role)` | Check if user has a specific role |
| `hasAnyRole($roles)` | Check if user has any of the given roles |

### CheckRole Middleware

`app/Http/Middleware/CheckRole.php`

| Aspect | Details |
|--------|---------|
| Registration | Added as `role` alias in `bootstrap/app.php` |
| Usage | `middleware('role:admin,staff')` |
| Behavior | Returns 403 if user's role doesn't match any allowed role |

---

## Security Rules

- **Refresh tokens** are SHA-256 hashed before database storage (plain text never persisted)
- **Token rotation** — every refresh generates a new refresh token and revokes the old one (prevents replay attacks)
- **Expiry validation** — both access tokens (15 min) and refresh tokens (30 days) have enforced expiries
- **IP/device tracking** — every token stores IP address and user agent for audit
- **Role-based access control** — all `/api/admin/*` routes require `role:admin,staff` middleware (returns 403 Forbidden on mismatch)
- **Default role** — newly registered users automatically get `role = 'customer'` (no admin access)
- **Rate limiting** — authentication endpoints are throttled via `throttle:api` middleware
- **Password hashing** — uses bcrypt via Laravel's `Hash::make()`

---

## Frontend Integration

### CSRF? Not Needed.

This API uses **Bearer token authentication**. There are no cookies, no sessions, no CSRF tokens.

### Critical: Send `Accept: application/json`

Every request **MUST** include the header:

```
Accept: application/json
```

Without it, Laravel treats the request as a browser request and **redirects** instead of returning JSON. This redirect causes CORS errors like:

```
Access to fetch at 'http://localhost:5174/' (redirected from 'http://localhost:8000/api/auth/login') has been blocked by CORS policy
```

The backend already forces this header via `ForceJsonResponse` middleware for all API routes, but it's best practice to also send it from the frontend.

### Token Storage Strategy

| Token | Storage | Details |
|-------|---------|---------|
| Access token | JavaScript memory / React state | Lost on page refresh → force refresh or re-login |
| Refresh token | `localStorage` or `httpOnly cookie` | `localStorage` is simpler; `httpOnly cookie` is more secure against XSS |

### Axios Setup (No CSRF)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
```

No `withCredentials`, no CSRF cookie endpoint, no `X-CSRF-TOKEN` header.

### Auth Service Example (React)

```javascript
// auth.js — Auth Service
import api from './api';

let accessToken = null;

const apiWithAuth = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json' },
});

// Attach access token to every request
apiWithAuth.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle 401 → refresh token → retry
apiWithAuth.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('http://localhost:8000/api/auth/refresh', {
          refresh_token: refreshToken,
        });

        accessToken = data.data.access_token;
        localStorage.setItem('refresh_token', data.data.refresh_token);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiWithAuth(original);
      } catch {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export function login(email, password) {
  return api.post('/auth/login', { email, password })
    .then(({ data }) => {
      accessToken = data.data.access_token;
      localStorage.setItem('refresh_token', data.data.refresh_token);
      return data.data.user;
    });
}

export function register(form) {
  return api.post('/auth/register', form)
    .then(({ data }) => {
      accessToken = data.data.access_token;
      localStorage.setItem('refresh_token', data.data.refresh_token);
      return data.data.user;
    });
}

export function logout() {
  apiWithAuth.post('/auth/logout').finally(() => {
    accessToken = null;
    localStorage.removeItem('refresh_token');
  });
}

export function me() {
  return apiWithAuth.get('/auth/me').then(({ data }) => data.data.user);
}

export function logoutAll() {
  return apiWithAuth.post('/auth/logout-all');
}
```

---

## Error Responses

### Validation Error `422`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Unauthenticated `401`

```json
{
  "success": false,
  "message": "Unauthorized"
}
```
