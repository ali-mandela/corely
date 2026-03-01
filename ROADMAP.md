# Corely ERP Frontend — Build Roadmap

## Backend Modules (Source of Truth)

| #   | Module     | API Prefix           | Pattern     |
| --- | ---------- | -------------------- | ----------- |
| 1   | Auth       | `/api/v1/auth`       | POST /login |
| 2   | Org Setup  | `/base/api/v1`       | Setup       |
| 3   | Users      | `/api/v1/users`      | CRUD        |
| 4   | Items      | `/api/v1/items`      | CRUD        |
| 5   | Inventory  | `/api/v1/inventory`  | CRUD        |
| 6   | Customers  | `/api/v1/customers`  | CRUD        |
| 7   | Vendors    | `/api/v1/vendors`    | CRUD        |
| 8   | POS        | `/api/v1/pos`        | CRUD        |
| 9   | Invoices   | `/api/v1/invoices`   | CRUD        |
| 10  | Audit Logs | `/api/v1/audit-logs` | Read        |
| 11  | Profile    | `/api/v1/profile`    | Read/Update |
| 12  | Reports    | `/api/v1/reports`    | Read        |
| 13  | Stores     | `/api/v1/stores`     | CRUD        |

---

## Build Order

### Phase 1 — Foundation

- **1A** Shared Components: Input, Textarea, Select, Button, Badge
- **1B** Core Services: API service, Auth service, JWT interceptor, Auth guard
- **1C** App Shell: Sidebar + header layout

### Phase 2 — Auth / Login

### Phase 3 — Dashboard / Reports

### Phase 4 — Users

### Phase 5 — Items / Products

### Phase 6 — Customers

### Phase 7 — Vendors

### Phase 8 — Inventory

### Phase 9 — POS

### Phase 10 — Invoices

### Phase 11 — Stores

### Phase 12 — Audit Logs

### Phase 13 — Profile & Settings

---

## DLS Constraints

- `rounded-sm` only (no rounded-lg/xl)
- Tight spacing (p-2 to p-4, gap-2 to gap-4)
- Lucide icons (no emojis)
- Inter font, neutral palette
- Subtle animations (fade-in, active:scale)
