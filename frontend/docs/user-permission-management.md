# फ्रंटएंड — User Management & Permission Management

> फ्रंटएंड (React 19 + Vite 8) पर User Management और Permission Management का पूरा आर्किटेक्चर, डेटा फ़्लो और कार्यप्रणाली।

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [State Management](#state-management)
- [User Management — Data Flow](#user-management--data-flow)
- [User Management — Pages](#user-management--pages)
- [Permission Management — Data Flow](#permission-management--data-flow)
- [Permission Management — Pages](#permission-management--pages)
- [Role Management — Data Flow](#role-management--data-flow)
- [Role Management — Pages](#role-management--pages)
- [Guard Components](#guard-components)
- [Route Definitions](#route-definitions)
- [API Service Layer](#api-service-layer)
- [Auth & Permission Checking Flow](#auth--permission-checking-flow)

---

## Architecture Overview

User Management और Permission Management फ्रंटएंड पर तीन-स्तरीय (three-layer) आर्किटेक्चर पर आधारित है:

```
Pages (UI) → Stores (State) → Services (API calls)
```

| Layer | Technology | Role |
|-------|-----------|------|
| **Pages** | React Components (JSX) | UI render, forms, tables, modals |
| **Stores** | Zustand | State management, caching, async actions |
| **Services** | Custom fetch-based API client | HTTP requests, error handling, token management |
| **Guards** | ProtectedRoute, PermissionGuard, RoleGuard | Access control, conditional rendering |

---

## State Management

### Auth Store (`stores/auth.store.js`)

सभी user/permission चेक का केंद्र। यह स्टोर सबसे ज़्यादा इम्पोर्टेंट है क्योंकि यह तय करता है कि कौन सा यूज़र क्या देख/कर सकता है।

```javascript
// Initial State
{
  user: JSON.parse(localStorage.getItem('admin') || 'null'),  // localStorage से पुनर्स्थापित
  permissions: [],                                             // /admin/me से लोड
  loading: false
}
```

| Method | Description |
|--------|-------------|
| `setUser(user)` | यूज़र को localStorage + state में सेट करें |
| `setPermissions(permissions)` | परमिशन्स को state में सेट करें |
| `login(email, password)` | लॉगिन करें → tokens save करें → user state में सेट करें |
| `logout()` | tokens + user + permissions clear करें |
| `fetchPermissions()` | `/admin/me` से permissions लोड करें |
| `hasPermission(name)` | चेक करें — **admin यूज़र के लिए हमेशा true** |
| `hasRole(role)` | चेक करें कि यूज़र का specific role है |
| `hasAnyRole(roles)` | चेक करें कि कोई एक role मैच करता है |

**महत्वपूर्ण:** `hasPermission('manage roles')` — अगर यूज़र एडमिन है तो बिना चेक किए `true` रिटर्न करता है।

### Users Store (`stores/users.store.js`)

```javascript
{
  users: [],           // User list (API से लोड)
  loading: false,       // Loading state
  pagination: { total: 0, page: 1, per_page: 20, last_page: 1 }
}
```

| Method | API Call | Description |
|--------|----------|-------------|
| `fetchUsers(params)` | `GET /admin/users` | users list load (search, filter, paginate) |
| `fetchUser(id)` | `GET /admin/users/{id}` | single user load |
| `createUser(data)` | `POST /admin/users` | नया user बनाएँ |
| `updateUser(id, data)` | `PUT /admin/users/{id}` | user update करें |
| `deleteUser(id)` | `DELETE /admin/users/{id}` | user delete करें |
| `toggleBlock(id)` | `PUT /admin/users/{id}/toggle-block` | block/unblock toggle |
| `assignRoles(id, roles)` | `POST /admin/users/{id}/roles` | roles assign करें |

### Roles Store (`stores/roles.store.js`)

```javascript
{
  roles: [],
  loading: false,
  pagination: { total: 0, page: 1, per_page: 20, last_page: 1 }
}
```

| Method | API Call | Description |
|--------|----------|-------------|
| `fetchRoles(params)` | `GET /admin/roles` | roles list load |
| `fetchAllRoles()` | `GET /admin/roles/all` | सभी roles load (बिना pagination) |
| `fetchRole(id)` | `GET /admin/roles/{id}` | single role load |
| `createRole(data)` | `POST /admin/roles` | नया role बनाएँ |
| `updateRole(id, data)` | `PUT /admin/roles/{id}` | role update करें |
| `deleteRole(id)` | `DELETE /admin/roles/{id}` | role delete करें |

### Permissions Store (`stores/permissions.store.js`)

```javascript
{
  permissions: [],           // Flat list
  groupedPermissions: {},    // Grouped object { "Users": [...], "Products": [...] }
  loading: false
}
```

| Method | API Call | Description |
|--------|----------|-------------|
| `fetchPermissions()` | `GET /admin/permissions` | सभी permissions load करें |
| `fetchGroupedPermissions()` | `GET /admin/permissions/grouped` | grouped permissions load करें |
| `createPermission(name)` | `POST /admin/permissions` | नई permission बनाएँ |
| `deletePermission(id)` | `DELETE /admin/permissions/{id}` | permission delete करें |
| `assignToRole(roleId, permissions)` | `POST /admin/permissions/assign-to-role/{roleId}` | role को permissions assign करें |
| `assignToUser(userId, permissions)` | `POST /admin/permissions/assign-to-user/{userId}` | user को permissions assign करें |

---

## User Management — Data Flow

### Users List Page

```
1. UsersPage mounts
2. → useUsersStore.fetchUsers({ search, role, status, page })
3. → api.get('/admin/users', params)
4. → Backend: UserController@index
5. → Response: { users: { data: [...], meta: {...} } }
6. → Store updates: users, pagination
7. → UI re-renders: table + pagination
```

### Create User Flow

```
1. CreateUserPage form submit
2. → useUsersStore.createUser(formData)
3. → api.post('/admin/users', formData)
4. → Backend: UserController@store
5. → Response: { user: {...} }
6. → Navigate to /admin/users (success toast)
```

### Assign Roles to User

```
1. UserDetailsPage or EditUserPage
2. Role selector (dropdown/checkbox) — roles loaded via fetchAllRoles()
3. On submit → useUsersStore.assignRoles(userId, selectedRoles)
4. → api.post('/admin/users/{id}/roles', { roles: [...] })
5. → Backend: UserController@assignRoles
6. → Response: { user: { roles: [...], permissions: [...] } }
7. → UI updates with new roles
```

### Block/Unblock

```
1. UsersPage → click block/unblock button
2. Confirmation dialog (AdminConfirmDialog)
3. → useUsersStore.toggleBlock(userId)
4. → api.put('/admin/users/{id}/toggle-block')
5. → Backend: toggles role between "blocked" and "customer"
6. → Store refreshes user list
```

---

## User Management — Pages

### UsersPage (`pages/users/UsersPage.jsx`)

| Feature | Description |
|---------|-------------|
| **Search** | नाम/ईमेल/फ़ोन से सर्च |
| **Filter** | Role dropdown + Status (active/blocked) filter |
| **Table** | Avatar, Name, Email, Phone, Role Badge, Status Badge, Created Date, Actions |
| **Pagination** | AdminPagination component |
| **Actions** | View (eye), Edit (pencil), Assign Roles (shield), Block/Unblock (ban), Delete (trash) |
| **Permission-based** | Action buttons PermissionGuard से कंडीशनली दिखते हैं |
| **Status Badge** | Active (green), Blocked (red) |

**Permission requirements for actions:**
- View: `view users`
- Create: `create users`
- Edit: `edit users`
- Delete: `delete users`
- Block/Unblock: `block users`
- Assign Roles: `assign roles`

### CreateUserPage (`pages/users/CreateUserPage.jsx`)

| Field | Type | Validation |
|-------|------|------------|
| Name | Text input | Required |
| Email | Email input | Required, valid email |
| Phone | Text input | Optional |
| Password | Password input | Required, min 8 chars |
| Confirm Password | Password input | Must match password |
| Status | Select (active/blocked) | Optional |
| Role | Select (roles list) | API से fetchAllRoles() से लोड |

### EditUserPage (`pages/users/EditUserPage.jsx`)

CreateUserPage जैसा ही, पर पहले से डेटा भरा होता है। पासवर्ड वैकल्पिक (खाली छोड़ने पर वही रहता है)।

### UserDetailsPage (`pages/users/UserDetailsPage.jsx`)

| Section | Content |
|---------|---------|
| **Avatar** | User avatar (or placeholder initials) |
| **Info** | Name, Email, Phone, Status Badge, Role Badge |
| **Roles** | Assigned roles as tags |
| **Permissions** | All permissions (from getAllPermissions) as tags |
| **Activity** | Orders count, last login, active sessions |
| **Actions** | Edit button, Assign Roles button, Block/Unblock button |

---

## Permission Management — Data Flow

### Permissions List

```
1. PermissionsPage mounts
2. → usePermissionsStore.fetchGroupedPermissions()
3. → api.get('/admin/permissions/grouped')
4. → Backend: groups by subject (second word of name)
5. → UI renders cards per group
```

### Add New Permission

```
1. PermissionsPage → click "Add Permission" button
2. Modal opens with name input
3. Submit → usePermissionsStore.createPermission(name)
4. → api.post('/admin/permissions', { name })
5. → Refresh list
```

### Delete Permission

```
1. PermissionsPage → click delete icon on a permission
2. Confirmation dialog (AdminConfirmDialog)
3. → usePermissionsStore.deletePermission(id)
4. → api.delete('/admin/permissions/{id}')
5. → Refresh list
```

### Assign Permissions to a Role

Roles Page पर Create/Edit Role form में permission matrix के ज़रिए होता है (नीचे देखें)।

---

## Permission Management — Pages

### PermissionsPage (`pages/permissions/PermissionsPage.jsx`)

| Feature | Description |
|---------|-------------|
| **Grouped View** | Permissions को group के हिसाब से cards में दिखाता है |
| **Groups** | Users, Products, Orders, Coupons, Banners, Analytics, Settings |
| **Add Permission** | Modal with name input — `manage permissions` permission चाहिए |
| **Delete Permission** | Confirmation dialog — `manage permissions` permission चाहिए |
| **Search** | Permission name से फ़िल्टर |

### PermissionGroupsPage (`pages/permissions/PermissionGroupsPage.jsx`)

Read-only view — permissions को module के हिसाब से आइकन्स के साथ दिखाता है। सिर्फ़ एडमिन्स के लिए।

---

## Role Management — Data Flow

### Roles List

```
1. RolesPage mounts
2. → useRolesStore.fetchRoles({ search, page })
3. → api.get('/admin/roles', params)
4. → Backend: RoleController@index (with permissions + users_count)
5. → UI renders cards
```

### Create/Edit Role

```
1. CreateRolePage mounts
2. → useRolesStore.fetchAllRoles() (for other roles reference — optional)
3. → usePermissionsStore.fetchGroupedPermissions() → permissions matrix
4. Form: name input + description + permission checkboxes (grouped)
5. Submit → useRolesStore.createRole({ name, description, permissions })
6. → api.post('/admin/roles', { name, description, permissions: [...] })
7. → Backend: creates role + syncs permissions
```

### Assigning Permissions to Role

CreateRolePage में एक **permissions matrix** है:

| Group | Header | Action |
|-------|--------|--------|
| **Users** | Select All checkbox | एक click में पूरे group की सभी permissions select/deselect |
| | view users | Individual checkbox |
| | create users | Individual checkbox |
| | edit users | Individual checkbox |
| | delete users | Individual checkbox (यह Super Admin को छोड़कर किसी को नहीं दी जाती) |
| | ... | ... |
| **Search** | Search input | Permission names को फ़िल्टर करता है |

### Delete Role

```
1. RolesPage → click delete on a role card
2. Confirmation dialog
3. → useRolesStore.deleteRole(id)
4. → api.delete('/admin/roles/{id}')
5. → Role removed from list
```

---

## Role Management — Pages

### RolesPage (`pages/roles/RolesPage.jsx`)

| Feature | Description |
|---------|-------------|
| **Layout** | Card-based grid |
| **Card Info** | Role name, Guard name, Permissions count, Users count, Permission tags (truncated), Created date |
| **Actions** | Edit, Delete (Super Admin के लिए delete disabled) |
| **Permission Guard** | Create/Edit — `manage roles`, Delete — `manage roles` |

### CreateRolePage (`pages/roles/CreateRolePage.jsx`)

यही कंपोनेंट Create और Edit दोनों के लिए उपयोग होता है (AdminRoutes.jsx में Edit के लिए भई यही इम्पोर्ट है)।

| Section | Description |
|---------|-------------|
| **Name** | Role name input — "Admin", "Manager", etc. |
| **Description** | Optional description textarea |
| **Permissions Matrix** | Grouped checkboxes — select all per group, search filter |

---

## Guard Components

### ProtectedRoute (`components/auth/ProtectedRoute.jsx`)

- Customer-facing routes के लिए
- Unauthenticated user → redirect to login

### PublicRoute (`components/auth/PublicRoute.jsx`)

- Login/Signup pages के लिए
- Authenticated user → redirect to home

### AdminRoute (`components/admin/AdminRoute.jsx`)

- Admin panel के लिए
- Checks: user authenticated + role is `admin` या `staff`
- Unauthorized → redirect to `/admin/login`

### PermissionGuard (`components/auth/PermissionGuard.jsx`)

```jsx
// सिर्फ़ "view analytics" permission वाले users को ही यह section दिखेगा
<PermissionGuard permission="view analytics">
  <AnalyticsWidget />
</PermissionGuard>

// Fallback UI भी दे सकते हैं
<PermissionGuard permission="manage roles" fallback={<p>Access denied</p>}>
  <RoleManagementPanel />
</PermissionGuard>
```

**Logic:**
```javascript
function PermissionGuard({ permission, children, fallback = null }) {
  const { hasPermission } = useAuthStore();

  if (hasPermission(permission)) {
    return children;   // Permission है → show
  }
  return fallback;     // Permission नहीं → null या fallback
}
```

### RoleGuard (`components/auth/RoleGuard.jsx`)

```jsx
// सिर्फ़ admin users को ही Settings link दिखेगा
<RoleGuard roles={['admin']}>
  <Link to="/admin/settings">Settings</Link>
</RoleGuard>
```

---

## Route Definitions

AdminRoutes.jsx में User, Role और Permission routes:

```jsx
// User Management
<Route path="users" element={<UsersPage />} />
<Route path="users/create" element={<CreateUserPage />} />
<Route path="users/:id" element={<UserDetailsPage />} />
<Route path="users/edit/:id" element={<EditUserPage />} />
<Route path="users/:id/roles" element={<EditUserPage />} />     {/* Roles assign */}

// Role Management
<Route path="roles" element={<RolesPage />} />
<Route path="roles/create" element={<CreateRolePage />} />
<Route path="roles/:id/edit" element={<CreateRolePage />} />    {/* Edit = same component */}

// Permission Management
<Route path="permissions" element={<PermissionsPage />} />
<Route path="permissions/groups" element={<PermissionGroupsPage />} />
```

**URL Structure:**
```
/admin/users              → Users List
/admin/users/create       → Create User
/admin/users/1            → User Details
/admin/users/edit/1       → Edit User
/admin/users/1/roles      → Assign Roles to User

/admin/roles              → Roles List
/admin/roles/create       → Create Role
/admin/roles/1/edit       → Edit Role

/admin/permissions        → Permissions (grouped)
/admin/permissions/groups → Permission Groups (read-only)
```

---

## API Service Layer

### Core API Client (`services/api.js`)

Token management और automatic refresh का केंद्र।

| Feature | Description |
|---------|-------------|
| **Access Token** | JavaScript memory में store (page refresh पर खत्म) |
| **Refresh Token** | localStorage में store |
| **401 Handling** | Access token expire होने पर auto-refresh + retry |
| **Token Queue** | Multiple concurrent 401s को handle करता है (एक बार refresh करो, सबको retry) |

### Admin Services

| Service | File | Methods |
|---------|------|---------|
| **User Service** | `services/admin/adminService.js` | `getAll`, `getById`, `toggleBlock` |
| **Role Service** | `services/admin/roleService.js` | `getAll`, `getAllSimple`, `getById`, `create`, `update`, `delete` |
| **Permission Service** | `services/admin/permissionService.js` | `getAll`, `getGrouped`, `create`, `delete`, `assignToRole`, `assignToUser` |

---

## Auth & Permission Checking Flow

### Login Flow

```
User enters credentials
  → POST /api/auth/login
  → Response: { user, access_token, refresh_token }
  → access_token → JavaScript memory (api.js)
  → refresh_token → localStorage
  → user → localStorage + auth.store (zustand)
  → Navigate to /admin/dashboard
```

### Permission Load Flow

```
AdminLayout mounts
  → useAuthStore.fetchPermissions() called
  → GET /api/admin/me (with Bearer token)
  → Response: { user: { id, name, ..., roles: [...], permissions: [...] } }
  → auth.store permissions updated
  → All PermissionGuard components re-evaluate
```

### Permission Check Example

```javascript
// auth.store.js
hasPermission: (permission) => {
  const { permissions, user } = get();

  // Super Admin / Admin → सब कुछ allowed
  if (user?.role === 'admin') return true;

  // Otherwise → check permissions array
  return permissions.some((p) => p.name === permission || p === permission);
}
```

### UI Permission Mapping

| UI Element | Required Permission | Display Condition |
|------------|-------------------|-------------------|
| Users menu item | `view users` | Admin role या view users permission |
| Create User button | `create users` | Permission check |
| Edit User button | `edit users` | Permission check |
| Delete User button | `delete users` | Permission check (Super Admin को नहीं) |
| Block/Unblock button | `block users` | Permission check |
| Assign Roles button | `assign roles` | Permission check |
| Roles menu item | `manage roles` | Permission check |
| Create Role button | `manage roles` | Permission check |
| Permissions menu item | `manage permissions` | Permission check |
| Settings menu item | `manage settings` | Only admin role |

---

## Summary

```
                    ┌─────────────────────────────────────────────┐
                    │              React Frontend                  │
                    │                                              │
    ┌───────────────┼──────────────────┬──────────────────────────┤
    │               │                  │                          │
    ▼               ▼                  ▼                          ▼
┌─────────┐  ┌───────────┐  ┌──────────────┐  ┌──────────────────┐
│  Auth   │  │ Permission│  │  Role Guard   │  │   Permission     │
│  Store  │  │  Guard    │  │  Component    │  │  Matrix (UI)     │
│(hasPerm)│  │(Component)│  │              │  │                  │
└────┬────┘  └─────┬─────┘  └──────┬───────┘  └────────┬─────────┘
     │              │               │                   │
     └──────────────┴───────────────┴───────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Zustand Stores │
                    │  (users/roles/  │
                    │   permissions)  │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  API Client     │
                    │  (api.js)       │
                    │  + Token Mgmt   │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Laravel Backend│
                    │  (Sanctum Auth  │
                    │   + Spatie RBAC)│
                    └─────────────────┘
```
