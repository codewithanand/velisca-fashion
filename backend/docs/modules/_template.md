# Module Name

> Brief description of what this module handles.

---

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/...` | Yes/No | Description |
| POST | `/api/...` | Yes/No | Description |

---

## 1. Endpoint Name

### `METHOD /api/...`

Description of what this endpoint does.

### Headers

```
Authorization: Bearer 1|abc123...sanctumToken
```

### Request

```json
{
  "field": "value"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `field` | required, string, max:255 |

### Response `200`

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Error `422`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field": ["Error message."]
  }
}
```

---

## Database Schema

### `table_name` table

| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |

---

## Code Structure

```
app/
├── Http/
│   ├── Controllers/API/...
│   ├── Requests/...
│   └── Resources/...
├── Services/...
└── Models/...
```
