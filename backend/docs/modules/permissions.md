# Permission Management Module

> **Spatie Laravel Permission** पैकेज पर आधारित RBAC (Role-Based Access Control) सिस्टम। रोल्स और परमिशन्स का पूरा प्रबंधन — क्रिएट, एडिट, डिलीट, असाइनमेंट।

---

## Table of Contents

- [Overview](#overview)
- [Endpoints — Roles](#endpoints--roles)
- [Endpoints — Permissions](#endpoints--permissions)
- [1. Roles List](#1-roles-list)
- [2. All Roles (Simple)](#2-all-roles-simple)
- [3. Create Role](#3-create-role)
- [4. Get Single Role](#4-get-single-role)
- [5. Update Role](#5-update-role)
- [6. Delete Role](#6-delete-role)
- [7. Permissions List](#7-permissions-list)
- [8. Grouped Permissions](#8-grouped-permissions)
- [9. Create Permission](#9-create-permission)
- [10. Delete Permission](#10-delete-permission)
- [11. Assign Permissions to Role](#11-assign-permissions-to-role)
- [12. Assign Permissions to User](#12-assign-permissions-to-user)
- [Role & Permission Hierarchy](#role--permission-hierarchy)
- [Database Schema](#database-schema)
- [Seeder Data](#seeder-data)
- [Code Structure](#code-structure)
- [Key Classes](#key-classes)

---

## Overview

यह मॉड्यूल दो-स्तरीय (two-layer) अनुमति प्रणाली प्रदान करता है:

1. **रोल-आधारित (RBAC):** रोल्स (जैसे "Admin", "Manager") को परमिशन्स असाइन करें, फिर यूज़र्स को रोल असाइन करें।
2. **डायरेक्ट परमिशन:** किसी भी यूज़र को डायरेक्ट परमिशन भी दी जा सकती है (रोल के अलावा)।

**महत्वपूर्ण:** यूज़र की अंतिम परमिशन्स `getAllPermissions()` से आती हैं — यह डायरेक्ट और रोल-आधारित सभी परमिशन्स को मर्ज करके लौटाता है।

---

## Endpoints — Roles

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/roles` | `auth:sanctum` + `role:admin,staff` | रोल्स की पेजिनेटेड सूची |
| GET | `/api/admin/roles/all` | `auth:sanctum` + `role:admin,staff` | सभी रोल्स (बिना पेजिनेशन) |
| POST | `/api/admin/roles` | `auth:sanctum` + `role:admin,staff` | नया रोल बनाएँ |
| GET | `/api/admin/roles/{id}` | `auth:sanctum` + `role:admin,staff` | एक रोल की जानकारी |
| PUT | `/api/admin/roles/{id}` | `auth:sanctum` + `role:admin,staff` | रोल अपडेट करें |
| DELETE | `/api/admin/roles/{id}` | `auth:sanctum` + `role:admin,staff` | रोल हटाएँ ("Super Admin" को नहीं) |

## Endpoints — Permissions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/permissions` | `auth:sanctum` + `role:admin,staff` | सभी परमिशन्स की सूची |
| GET | `/api/admin/permissions/grouped` | `auth:sanctum` + `role:admin,staff` | ग्रुप में विभाजित परमिशन्स |
| POST | `/api/admin/permissions` | `auth:sanctum` + `role:admin,staff` | नई परमिशन बनाएँ |
| DELETE | `/api/admin/permissions/{id}` | `auth:sanctum` + `role:admin,staff` | परमिशन हटाएँ |
| POST | `/api/admin/permissions/assign-to-role/{roleId}` | `auth:sanctum` + `role:admin,staff` | रोल को परमिशन्स असाइन करें |
| POST | `/api/admin/permissions/assign-to-user/{userId}` | `auth:sanctum` + `role:admin,staff` | यूज़र को डायरेक्ट परमिशन्स दें |

---

## 1. Roles List

### `GET /api/admin/roles`

सभी रोल्स की पेजिनेटेड सूची। हर रोल के साथ उसकी परमिशन्स और यूज़र्स काउंट भी आता है।

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | — | नाम से सर्च |
| `per_page` | integer | 20 | प्रति पेज आइटम्स |

### Response `200`

```json
{
  "success": true,
  "message": "Roles retrieved",
  "data": {
    "roles": {
      "data": [
        {
          "id": 1,
          "name": "Super Admin",
          "guard_name": "web",
          "created_at": "2024-01-01T00:00:00.000000Z",
          "updated_at": "2024-01-01T00:00:00.000000Z",
          "permissions": [
            { "id": 1, "name": "view users", "guard_name": "web" }
          ],
          "users_count": 1
        }
      ],
      "meta": {
        "total": 8,
        "page": 1,
        "per_page": 20,
        "last_page": 1
      }
    }
  }
}
```

---

## 2. All Roles (Simple)

### `GET /api/admin/roles/all`

बिना पेजिनेशन के सभी रोल्स — ड्रॉपडाउन या फ़ॉर्म में उपयोग के लिए।

### Response `200`

```json
{
  "success": true,
  "message": "All roles retrieved",
  "data": {
    "roles": [
      { "id": 1, "name": "Super Admin", "guard_name": "web", "permissions": [...] },
      { "id": 2, "name": "Admin", "guard_name": "web", "permissions": [...] }
    ]
  }
}
```

---

## 3. Create Role

### `POST /api/admin/roles`

नया रोल बनाएँ। साथ में परमिशन्स भी असाइन कर सकते हैं।

### Request

```json
{
  "name": "Support Manager",
  "description": "Manages customer support team",
  "permissions": ["view users", "view orders", "update orders"]
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `name` | required, string, max:255, unique:roles,name |
| `description` | nullable, string |
| `permissions` | nullable, array |
| `permissions.*` | string, exists:permissions,name |

### Response `201`

```json
{
  "success": true,
  "message": "Role created",
  "data": {
    "role": {
      "id": 9,
      "name": "Support Manager",
      "guard_name": "web",
      "updated_at": "2024-01-01T00:00:00.000000Z",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "permissions": [
        { "id": 1, "name": "view users", "guard_name": "web" },
        { "id": 13, "name": "view orders", "guard_name": "web" },
        { "id": 14, "name": "update orders", "guard_name": "web" }
      ]
    }
  }
}
```

---

## 4. Get Single Role

### `GET /api/admin/roles/{id}`

एक रोल की पूरी जानकारी — परमिशन्स और यूज़र्स काउंट सहित।

### Response `200`

```json
{
  "success": true,
  "message": "Role retrieved",
  "data": {
    "role": {
      "id": 1,
      "name": "Super Admin",
      "guard_name": "web",
      "users_count": 1,
      "permissions": [...]
    }
  }
}
```

### Error `404`

```json
{
  "success": false,
  "message": "Role not found"
}
```

---

## 5. Update Role

### `PUT /api/admin/roles/{id}`

रोल का नाम और परमिशन्स अपडेट करें।

### Request

```json
{
  "name": "Senior Manager",
  "permissions": ["view users", "view products", "view orders", "view analytics"]
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `name` | required, string, max:255, unique:roles,name,{id} |
| `description` | nullable, string |
| `permissions` | nullable, array |
| `permissions.*` | string, exists:permissions,name |

**Note:** `permissions` फ़ील्ड न भेजने पर पुरानी परमिशन्स वैसे ही रहेंगी। खाली ऐरे `[]` भेजने पर सारी परमिशन्स हट जाएँगी।

### Response `200`

```json
{
  "success": true,
  "message": "Role updated",
  "data": {
    "role": { "...": "updated role object" }
  }
}
```

---

## 6. Delete Role

### `DELETE /api/admin/roles/{id}`

रोल हटाएँ। **"Super Admin" रोल को नहीं हटा सकते।**

### Response `200`

```json
{
  "success": true,
  "message": "Role deleted"
}
```

### Error `400`

```json
{
  "success": false,
  "message": "Cannot delete Super Admin role"
}
```

---

## 7. Permissions List

### `GET /api/admin/permissions`

सभी परमिशन्स की सूची। नाम से सर्च कर सकते हैं।

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | नाम से सर्च (जैसे "view users") |

### Response `200`

```json
{
  "success": true,
  "message": "Permissions retrieved",
  "data": {
    "permissions": [
      { "id": 1, "name": "view users", "guard_name": "web" },
      { "id": 2, "name": "create users", "guard_name": "web" },
      { "id": 3, "name": "edit users", "guard_name": "web" }
    ]
  }
}
```

---

## 8. Grouped Permissions

### `GET /api/admin/permissions/grouped`

परमिशन्स को उनके नाम के दूसरे शब्द के आधार पर ग्रुप करके लौटाता है।
- `"view users"` → ग्रुप: **Users**
- `"create products"` → ग्रुप: **Products**
- `"manage settings"` → ग्रुप: **Settings**

ग्रुपिंग फ़्रंटएंड पर परमिशन्स को कैटेगरी में दिखाने के लिए उपयोगी है।

### Response `200`

```json
{
  "success": true,
  "message": "Permissions grouped",
  "data": {
    "groups": {
      "Users": [
        { "id": 1, "name": "view users", "guard_name": "web" },
        { "id": 2, "name": "create users", "guard_name": "web" },
        { "id": 3, "name": "edit users", "guard_name": "web" },
        { "id": 4, "name": "delete users", "guard_name": "web" },
        { "id": 5, "name": "block users", "guard_name": "web" },
        { "id": 6, "name": "assign roles", "guard_name": "web" }
      ],
      "Products": [
        { "id": 7, "name": "view products", "guard_name": "web" },
        ...
      ]
    }
  }
}
```

---

## 9. Create Permission

### `POST /api/admin/permissions`

नई परमिशन बनाएँ।

### Request

```json
{
  "name": "export reports"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `name` | required, string, max:255, unique:permissions,name |
| `guard_name` | nullable, string (default: "web") |

### Response `201`

```json
{
  "success": true,
  "message": "Permission created",
  "data": {
    "permission": {
      "id": 31,
      "name": "export reports",
      "guard_name": "web",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  }
}
```

---

## 10. Delete Permission

### `DELETE /api/admin/permissions/{id}`

परमिशन हटाएँ।

### Response `200`

```json
{
  "success": true,
  "message": "Permission deleted"
}
```

---

## 11. Assign Permissions to Role

### `POST /api/admin/permissions/assign-to-role/{roleId}`

किसी रोल को परमिशन्स असाइन करें। पहले से असाइन परमिशन्स हटा दी जाएँगी (sync)।

### Request

```json
{
  "permissions": ["view users", "view products", "view orders"]
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `permissions` | required, array |
| `permissions.*` | string, exists:permissions,name |

### Response `200`

```json
{
  "success": true,
  "message": "Permissions assigned to role",
  "data": {
    "role": { "...": "role with updated permissions" }
  }
}
```

### Error `404`

```json
{
  "success": false,
  "message": "Role not found"
}
```

---

## 12. Assign Permissions to User

### `POST /api/admin/permissions/assign-to-user/{userId}`

किसी यूज़र को डायरेक्ट परमिशन्स दें (रोल के अलावा)।

### Request

```json
{
  "permissions": ["view analytics", "view reports"]
}
```

### Response `200`

```json
{
  "success": true,
  "message": "Permissions assigned to user",
  "data": {
    "user": { "...": "user with updated permissions" }
  }
}
```

### Error `404`

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Role & Permission Hierarchy

### Permission Groups (7 ग्रुप्स, कुल 30+ परमिशन्स)

| Group | Permissions |
|-------|-------------|
| **Users** | view users, create users, edit users, delete users, block users, assign roles |
| **Products** | view products, create products, edit products, delete products, manage inventory |
| **Orders** | view orders, update orders, cancel orders, manage shipments |
| **Coupons** | view coupons, create coupons, edit coupons, delete coupons |
| **Banners** | view banners, create banners, edit banners, delete banners |
| **Analytics** | view analytics, view reports |
| **Settings** | manage settings, manage roles, manage permissions |

### Default Roles (8 रोल्स)

| Role | Permissions | Users Count (Seed) |
|------|-------------|-------------------|
| **Super Admin** | सभी परमिशन्स (30+) | 1 (admin@velisca.com) |
| **Admin** | Users (सभी), Products (सभी), Orders (सभी), Coupons (सभी), Banners (सभी), Analytics (सभी), Settings (manage settings) — delete users को छोड़कर | 1 (staff@velisca.com) |
| **Manager** | view users, view/create/edit products, manage inventory, view/update orders, view analytics/reports | — |
| **Inventory Manager** | view products, manage inventory | — |
| **Order Manager** | view/update/cancel orders, manage shipments | — |
| **Customer Support** | view users, view/update/cancel orders | — |
| **Content Manager** | view/create/edit products, view/create/edit/delete banners | — |
| **Customer** | कोई परमिशन नहीं | 1 (test@example.com) |

### परमिशन चेक करने का तरीका

**Backend:** Spatie middleware `role:admin,staff` और `permission:view users` का उपयोग करता है।

**Frontend:** `useAuthStore().hasPermission('view users')` — एडमिन यूज़र के लिए हमेशा `true` रिटर्न करता है।

```javascript
// auth.store.js
hasPermission: (permission) => {
  const { permissions, user } = get();
  if (user?.role === 'admin') return true;  // एडमिन को सब चलता है
  return permissions.some((p) => p.name === permission || p === permission);
}
```

---

## Database Schema

### `permissions` table

| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(255) | unique — e.g. "view users" |
| guard_name | varchar(255) | "web" |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

### `roles` table

| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(255) | unique — e.g. "Super Admin" |
| guard_name | varchar(255) | "web" |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

### `role_has_permissions` table (Pivot)

| Column | Type | Constraints |
|--------|------|-------------|
| permission_id | bigint unsigned | FK → permissions.id |
| role_id | bigint unsigned | FK → roles.id |

### `model_has_roles` table (Pivot)

| Column | Type | Constraints |
|--------|------|-------------|
| role_id | bigint unsigned | FK → roles.id |
| model_type | varchar(255) | `App\Models\User` |
| model_id | bigint unsigned | FK → users.id |

### `model_has_permissions` table (Pivot)

| Column | Type | Constraints |
|--------|------|-------------|
| permission_id | bigint unsigned | FK → permissions.id |
| model_type | varchar(255) | `App\Models\User` |
| model_id | bigint unsigned | FK → users.id |

---

## Seeder Data

डेटाबेस सीड करने के लिए:

```bash
php artisan db:seed
```

Seeder `DatabaseSeeder.php` निम्न कार्य करता है:
1. सभी 30+ परमिशन्स 7 ग्रुप्स में बनाता है
2. 8 रोल्स बनाता है (Super Admin से Customer तक)
3. हर रोल को उचित परमिशन्स देता है
4. 3 डिफ़ॉल्ट यूज़र बनाता है और उन्हें रोल असाइन करता है

---

## Code Structure

```
app/
├── Http/
│   ├── Controllers/API/Admin/
│   │   ├── RoleController.php           # Role CRUD + all
│   │   └── PermissionController.php     # Permission CRUD + grouped + assignToRole/User
│   └── Middleware/
│       └── CheckRole.php                # role middleware (admin/staff check)
├── Models/
│   └── User.php                         # HasRoles trait (Spatie)
routes/
└── api.php                              # Role + Permission routes (lines 84-97)
config/
└── permission.php                       # Spatie config (tables, cache, teams)
database/
├── migrations/
│   └── 2024_01_01_000010_create_permission_tables.php   # Spatie tables
└── seeders/
    └── DatabaseSeeder.php              # All roles, permissions & default users
frontend/
├── src/
│   ├── stores/
│   │   ├── roles.store.js              # Zustand — fetchRoles, createRole, etc.
│   │   ├── permissions.store.js        # Zustand — fetchPermissions, assignToRole, etc.
│   │   └── auth.store.js               # hasPermission(), hasRole(), hasAnyRole()
│   ├── services/admin/
│   │   ├── roleService.js              # API calls for roles
│   │   └── permissionService.js        # API calls for permissions
│   ├── pages/roles/
│   │   ├── RolesPage.jsx               # Role list with cards
│   │   └── CreateRolePage.jsx          # Role form with permission matrix
│   ├── pages/permissions/
│   │   ├── PermissionsPage.jsx         # Permission list (grouped)
│   │   └── PermissionGroupsPage.jsx    # Read-only permission groups view
│   ├── components/auth/
│   │   ├── PermissionGuard.jsx         # Conditional render by permission
│   │   └── RoleGuard.jsx               # Conditional render by role
│   └── routes/
│       └── AdminRoutes.jsx             # /admin/roles/*, /admin/permissions/* routes
```

---

## Key Classes

### RoleController

`app/Http/Controllers/API/Admin/RoleController.php`

| Method | Purpose |
|--------|---------|
| `index()` | पेजिनेटेड रोल लिस्ट — सर्च + permissions + users_count |
| `all()` | सभी रोल्स बिना पेजिनेशन (ड्रॉपडाउन के लिए) |
| `store()` | नया रोल बनाएँ + वैकल्पिक परमिशन्स |
| `show()` | सिंगल रोल — permissions + users_count सहित |
| `update()` | रोल अपडेट + permission sync |
| `destroy()` | रोल डिलीट — "Super Admin" को प्रोटेक्टेड |

### PermissionController

`app/Http/Controllers/API/Admin/PermissionController.php`

| Method | Purpose |
|--------|---------|
| `index()` | सभी परमिशन्स — सर्च के साथ |
| `grouped()` | परमिशन्स को ग्रुप में बाँटें (नाम के दूसरे शब्द से) |
| `store()` | नई परमिशन बनाएँ |
| `destroy()` | परमिशन डिलीट करें |
| `assignToRole($roleId)` | रोल को परमिशन्स असाइन करें (sync) |
| `assignToUser($userId)` | यूज़र को डायरेक्ट परमिशन्स दें (sync) |

### Frontend — PermissionGuard

`frontend/src/components/auth/PermissionGuard.jsx`

```jsx
// कंपोनेंट को परमिशन के आधार पर दिखाएँ/छुपाएँ
<PermissionGuard permission="manage roles">
  <button>Create Role</button>
</PermissionGuard>
```

### Frontend — RoleGuard

`frontend/src/components/auth/RoleGuard.jsx`

```jsx
// कंपोनेंट को रोल के आधार पर दिखाएँ/छुपाएँ
<RoleGuard roles={['admin']}>
  <button>Settings</button>
</RoleGuard>
```

### Frontend — Auth Store

`frontend/src/stores/auth.store.js`

| Method | Purpose |
|--------|---------|
| `hasPermission(permission)` | चेक करें — एडमिन के लिए हमेशा true |
| `hasRole(role)` | चेक करें कि यूज़र का specific role है |
| `hasAnyRole(roles)` | चेक करें कि कोई एक role मैच करता है |
| `fetchPermissions()` | `/admin/me` से परमिशन्स लोड करें |
