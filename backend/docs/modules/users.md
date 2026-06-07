# User Management Module

> एडमिन पैनल से उपयोगकर्ताओं (Users) का प्रबंधन — CRUD, सर्च, फ़िल्टर, ब्लॉक/अनब्लॉक, रोल असाइनमेंट।

---

## Table of Contents

- [Endpoints](#endpoints)
- [1. Users List](#1-users-list)
- [2. Create User](#2-create-user)
- [3. Get Single User](#3-get-single-user)
- [4. Update User](#4-update-user)
- [5. Delete User](#5-delete-user)
- [6. Toggle Block](#6-toggle-block)
- [7. Assign Roles](#7-assign-roles)
- [Database Schema](#database-schema)
- [Code Structure](#code-structure)
- [Key Classes](#key-classes)

---

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | `auth:sanctum` + `role:admin,staff` | सभी उपयोगकर्ताओं की सूची (पेजिनेटेड) |
| POST | `/api/admin/users` | `auth:sanctum` + `role:admin,staff` | नया उपयोगकर्ता बनाएँ |
| GET | `/api/admin/users/{id}` | `auth:sanctum` + `role:admin,staff` | एक उपयोगकर्ता की जानकारी |
| PUT | `/api/admin/users/{id}` | `auth:sanctum` + `role:admin,staff` | उपयोगकर्ता अपडेट करें |
| DELETE | `/api/admin/users/{id}` | `auth:sanctum` + `role:admin,staff` | उपयोगकर्ता हटाएँ (एडमिन को नहीं) |
| PUT | `/api/admin/users/{id}/toggle-block` | `auth:sanctum` + `role:admin,staff` | ब्लॉक/अनब्लॉक टॉगल करें |
| POST | `/api/admin/users/{id}/roles` | `auth:sanctum` + `role:admin,staff` | उपयोगकर्ता को रोल असाइन करें |

---

## 1. Users List

### `GET /api/admin/users`

सभी उपयोगकर्ताओं की पेजिनेटेड सूची प्राप्त करें। नाम, ईमेल और फ़ोन से सर्च कर सकते हैं। रोल और स्टेटस से फ़िल्टर कर सकते हैं।

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | — | नाम, ईमेल या फ़ोन से सर्च |
| `role` | string | — | स्पेसिफिक रोल वाले यूज़र दिखाएँ (जैसे "Admin") |
| `status` | string | — | `active` या `blocked` — स्टेटस फ़िल्टर |
| `per_page` | integer | 20 | प्रति पेज आइटम्स की संख्या |
| `page` | integer | 1 | पेज नंबर |

### Response `200`

```json
{
  "success": true,
  "message": "Users retrieved",
  "data": {
    "users": {
      "data": [
        {
          "id": 1,
          "name": "Admin",
          "email": "admin@velisca.com",
          "phone": null,
          "avatar": null,
          "role": "admin",
          "email_verified_at": null,
          "created_at": "2024-01-01T00:00:00.000000Z",
          "updated_at": "2024-01-01T00:00:00.000000Z",
          "roles": [
            { "id": 1, "name": "Super Admin" }
          ],
          "permissions": [
            { "id": 1, "name": "view users" }
          ]
        }
      ],
      "meta": {
        "total": 10,
        "page": 1,
        "per_page": 20,
        "last_page": 1
      }
    }
  }
}
```

---

## 2. Create User

### `POST /api/admin/users`

नया उपयोगकर्ता बनाएँ। वैकल्पिक रूप से रोल भी असाइन कर सकते हैं।

### Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "securePass123",
  "role": "staff",
  "roles": ["Admin"],
  "avatar": null
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `name` | required, string, max:255 |
| `email` | required, email, unique:users |
| `phone` | nullable, string, max:20 |
| `password` | required, string, min:8 |
| `role` | nullable, string (admin/staff/customer/blocked) |
| `roles` | nullable, array |
| `roles.*` | string, exists:roles,name |
| `avatar` | nullable, string |

### Response `201`

```json
{
  "success": true,
  "message": "User created",
  "data": {
    "user": { "...": "user object" }
  }
}
```

---

## 3. Get Single User

### `GET /api/admin/users/{id}`

किसी एक उपयोगकर्ता की पूरी जानकारी — रोल्स और परमिशन्स सहित।

### Response `200`

```json
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "user": { "...": "user object" }
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

## 4. Update User

### `PUT /api/admin/users/{id}`

उपयोगकर्ता की जानकारी अपडेट करें। केवल भेजे गए फ़ील्ड ही अपडेट होंगे। पासवर्ड खाली छोड़ने पर वही रहेगा।

### Request

```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "phone": "9876543210",
  "role": "staff",
  "roles": ["Manager", "Customer Support"],
  "status": "active"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `name` | sometimes, string, max:255 |
| `email` | sometimes, email, unique:users,email,{id} |
| `phone` | nullable, string, max:20 |
| `password` | nullable, string, min:8 |
| `role` | nullable, string |
| `roles` | nullable, array |
| `roles.*` | string, exists:roles,name |
| `avatar` | nullable, string |
| `status` | nullable, string, in:active,blocked |

**Note:** `status: "blocked"` भेजने पर `role` अपने आप `"blocked"` हो जाता है।

### Response `200`

```json
{
  "success": true,
  "message": "User updated",
  "data": {
    "user": { "...": "user object" }
  }
}
```

---

## 5. Delete User

### `DELETE /api/admin/users/{id}`

उपयोगकर्ता को डिलीट करें। **एडमिन यूज़र को डिलीट नहीं कर सकते।**

### Response `200`

```json
{
  "success": true,
  "message": "User deleted"
}
```

### Error `400`

```json
{
  "success": false,
  "message": "Cannot delete admin users"
}
```

---

## 6. Toggle Block

### `PUT /api/admin/users/{id}/toggle-block`

उपयोगकर्ता को ब्लॉक या अनब्लॉक करें। **एडमिन और स्टाफ़ यूज़र को ब्लॉक नहीं कर सकते।**

### Behavior

- अगर यूज़र का `role === "blocked"` है → `role` को `"customer"` कर देगा (अनब्लॉक)
- अगर यूज़र का `role !== "blocked"` है → `role` को `"blocked"` कर देगा (ब्लॉक)

### Response `200`

```json
{
  "success": true,
  "message": "User status updated",
  "data": {
    "user": { "...": "user object" }
  }
}
```

### Error `400`

```json
{
  "success": false,
  "message": "Cannot block admin or staff users"
}
```

---

## 7. Assign Roles

### `POST /api/admin/users/{id}/roles`

उपयोगकर्ता को एक या अधिक स्पैटी रोल असाइन करें। पहले से असाइन रोल हटा दिए जाएँगे (sync)।

### Request

```json
{
  "roles": ["Admin", "Manager"]
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `roles` | required, array |
| `roles.*` | string, exists:roles,name |

### Response `200`

```json
{
  "success": true,
  "message": "Roles assigned",
  "data": {
    "user": { "...": "user object with updated roles" }
  }
}
```

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
| password | varchar(255) | required (hashed via bcrypt) |
| avatar | varchar(255) | nullable |
| **role** | varchar(20) | default `'customer'` — values: `customer`, `staff`, `admin`, `blocked` |
| remember_token | varchar(100) | nullable |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

### `model_has_roles` table (Spatie)

| Column | Type | Constraints |
|--------|------|-------------|
| role_id | bigint unsigned | FK → roles.id |
| model_type | varchar(255) | `App\Models\User` |
| model_id | bigint unsigned | FK → users.id |

### `model_has_permissions` table (Spatie)

| Column | Type | Constraints |
|--------|------|-------------|
| permission_id | bigint unsigned | FK → permissions.id |
| model_type | varchar(255) | `App\Models\User` |
| model_id | bigint unsigned | FK → users.id |

---

## Code Structure

```
app/
├── Http/
│   ├── Controllers/API/Admin/
│   │   └── UserController.php       # CRUD + toggleBlock + assignRoles
│   └── Resources/
│       └── UserResource.php         # JSON transformer (roles, permissions)
├── Models/
│   └── User.php                     # HasApiTokens, HasRoles, role constants & helpers
routes/
└── api.php                          # Admin user routes (lines 75-81)
frontend/
├── src/
│   ├── stores/
│   │   └── users.store.js           # Zustand store — fetchUsers, createUser, etc.
│   ├── services/admin/
│   │   └── adminService.js          # API calls for users
│   ├── pages/users/
│   │   ├── UsersPage.jsx            # User list with search, filter, actions
│   │   ├── CreateUserPage.jsx       # Create form
│   │   ├── EditUserPage.jsx         # Edit form
│   │   └── UserDetailsPage.jsx      # User detail view
│   └── routes/
│       └── AdminRoutes.jsx          # Route definitions (/admin/users/*)
```

---

## Key Classes

### UserController

`app/Http/Controllers/API/Admin/UserController.php`

| Method | Purpose |
|--------|---------|
| `index()` | पेजिनेटेड यूज़र लिस्ट — सर्च + फ़िल्टर (role, status) |
| `store()` | नया यूज़र बनाएँ — वैकल्पिक स्पैटी रोल्स के साथ |
| `show()` | सिंगल यूज़र दिखाएँ — roles/permissions सहित |
| `update()` | यूज़र अपडेट — फ़ील्ड-बाइ-फ़ील्ड अपडेट, पासवर्ड वैकल्पिक |
| `destroy()` | यूज़र डिलीट — एडमिन यूज़र को डिलीट होने से रोकता है |
| `toggleBlock()` | ब्लॉक/अनब्लॉक टॉगल — एडमिन/स्टाफ़ को ब्लॉक नहीं कर सकते |
| `assignRoles()` | स्पैटी रोल्स को सिंक करें (पुराने हटाकर नए लगाएँ) |

### User Model — Role Constants & Helpers

`app/Models/User.php`

| Constant / Method | Purpose |
|-------------------|---------|
| `ROLE_ADMIN = 'admin'` | एडमिन रोल कॉन्स्टेंट |
| `ROLE_STAFF = 'staff'` | स्टाफ़ रोल कॉन्स्टेंट |
| `ROLE_CUSTOMER = 'customer'` | कस्टमर रोल कॉन्स्टेंट |
| `isAdmin(): bool` | चेक करें कि यूज़र एडमिन है या नहीं |
| `isStaff(): bool` | चेक करें कि यूज़र स्टाफ़ है या नहीं |
| `isCustomer(): bool` | चेक करें कि यूज़र कस्टमर है या नहीं |
| `hasRole($role): bool` | चेक करें कि यूज़र का specific role है या नहीं |
| `hasAnyRole($roles): bool` | चेक करें कि यूज़र के पास दिए गए roles में से कोई है या नहीं |

यूज़र मॉडल `Spatie\Permission\Traits\HasRoles` ट्रेट का उपयोग करता है, जो `assignRole()`, `syncRoles()`, `getAllPermissions()` जैसे मेथड्स प्रदान करता है।

### UserResource

`app/Http/Resources/UserResource.php`

JSON रिस्पॉन्स फ़ॉर्मेटर। यूज़र डेटा के साथ roles और permissions भी भेजता है (जब वे लोड हों)।

Permissons `getAllPermissions()` से आते हैं — यह स्पैटी का मेथड है जो यूज़र को डायरेक्ट और उसके रोल्स के ज़रिए मिली सभी परमिशन्स को मर्ज करके लौटाता है।
