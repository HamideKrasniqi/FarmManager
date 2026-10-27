# FarmManager — Multi-Tenant SaaS Farm Management

Graduation / diploma project: a **multi-tenant** farm management SPA with role-based access control, JWT auth, subscription pricing, bilingual UI (English / Albanian), and a task verification + rating workflow.

## Architecture

```
[ React SPA (Vite + Tailwind + i18next) ]
        │  REST + JWT Bearer
        ▼
[ Django REST Framework ]
  ├── RBAC permissions (SuperAdmin / Owner / Manager / Worker)
  ├── Tenant isolation (filter by farm_id)
  ├── Subscription plans (Free / Basic / Pro / Enterprise)
  └── Domain apps: farms, accounts, livestock, crops, finances, tasks, hr
        │
        ▼
[ MySQL / PostgreSQL / SQLite ]
```

## Project structure

```
farm-management/
├── backend/                 # Django + DRF API
│   ├── apps/
│   │   ├── accounts/        # User, JWT, RBAC, employees, farm registration
│   │   ├── farms/           # Tenant Farm, plans/pricing, SuperAdmin metrics
│   │   ├── livestock/       # Animals
│   │   ├── crops/           # Fields / crops
│   │   ├── finances/        # Owner-only transactions
│   │   ├── tasks/           # Task lifecycle + verify/rate
│   │   └── hr/              # Salaries + vacation / leave requests
│   ├── config/              # Settings & root URLs
│   ├── manage.py
│   └── requirements.txt
└── frontend/                # React + Vite + Tailwind
    └── src/
        ├── api/             # Axios client + service wrappers
        ├── context/         # AuthProvider
        ├── i18n/            # English + Albanian (sq) translations
        ├── components/      # Layout, LanguageSwitcher, pricing cards, badges
        ├── constants/       # Pricing plan catalog (UI)
        └── pages/           # Marketing + role-aware app screens
```

## Features

### Core platform
- Multi-tenant farms isolated by `farm_id`
- JWT login / refresh with suspended-farm blocking
- Role-based dashboards and navigation
- Task workflow with verification and 1–5 star ratings
- Livestock, crops, finances (owner), employees, salaries, vacations

### Subscription packages (registration)
Farms choose a plan when registering. Public catalog + SuperAdmin can adjust per-tenant pricing.

| Plan | Default price | Typical use |
|------|---------------|-------------|
| **FREE** | €0 / month | Trial / small farms |
| **BASIC** | €29 / month | Growing operations |
| **PRO** | €79 / month | Finances & payroll |
| **ENTERPRISE** | €199 / month | Full + admin tooling |

- Register page: package selection before farm/owner details
- Marketing **Pricing** page (`/pricing`)
- Public API: `GET /api/v1/pricing/plans/`
- SuperAdmin: assign plan + monthly price per farm (MRR metrics)

### Bilingual UI (English / Albanian)
- `i18next` + `react-i18next`
- Language switcher (EN / SQ) on marketing and app chrome
- Locale persisted in `localStorage` (`fm_locale`)
- User-entered content (farm names, task titles, etc.) stays as entered; platform UI is translated

### Leave / vacations
| Who | What they can do |
|-----|------------------|
| **Worker** | Submit own leave; cancel pending; see own history |
| **Manager** | Submit **own** leave → **Owner** approval; review **worker** leave |
| **Owner** | Review worker **and** manager leave requests |

Leave types: Annual, Medical, Personal, Unpaid.

## Roles (RBAC)

| Role | Capabilities |
|------|----------------|
| **SUPERADMIN** | All farms, suspend/activate, plans & pricing, platform MRR / metrics |
| **OWNER** | Full farm: livestock, crops, finances, employees, salaries, task verify/rate, approve all leave |
| **MANAGER** | Ops: livestock, crops, assign/verify tasks; review **worker** leave; request **own** leave (owner approves); **no** finances/salaries |
| **WORKER** | Assigned tasks (status updates); own leave requests; own salary view |

## Task workflow

```
PENDING → IN_PROGRESS → COMPLETED → APPROVED  (rating 1–5 + feedback)
                              ↘ REJECTED → IN_PROGRESS (rework)
```

## Quick start

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env

python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

API base: `http://127.0.0.1:8000/api/v1/`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://127.0.0.1:5173` (Vite proxies `/api` → Django)

### Demo credentials

Created by `python manage.py seed_demo`. Passwords are **hashed** in the database — use this table (or `changepassword`) if you need to sign in again.

| User | Password | Role |
|------|----------|------|
| `superadmin` | `SuperAdmin123!` | Platform SuperAdmin |
| `owner` | `Owner123!` | Farm Owner (Green Valley) |
| `manager` | `Manager123!` | Farm Manager |
| `worker` | `Worker123!` | Farm Worker |

> The login screen does **not** show quick-demo buttons; enter credentials manually.

## Key API endpoints

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/v1/auth/login/` | JWT + user profile |
| POST | `/api/v1/auth/register/` | Create farm + owner (**includes `plan`**) |
| GET | `/api/v1/auth/me/` | Current user |
| GET | `/api/v1/pricing/plans/` | Public subscription catalog |
| GET | `/api/v1/dashboard/` | Farm KPIs (role-aware) |
| GET | `/api/v1/admin/metrics/` | SuperAdmin global KPIs + MRR |
| POST | `/api/v1/admin/farms/{id}/suspend/` | Suspend tenant |
| PATCH | `/api/v1/admin/farms/{id}/` | Update plan / monthly price |
| CRUD | `/api/v1/animals/`, `/crops/`, `/transactions/`, `/tasks/` | Tenant-scoped |
| POST | `/api/v1/tasks/{id}/update-status/` | Worker transition |
| POST | `/api/v1/tasks/{id}/verify/` | Approve/reject + rating |
| CRUD | `/api/v1/salaries/` | Owner manage; worker `mine/` |
| CRUD | `/api/v1/vacations/` | Worker/Manager create own; Owner/Manager review |
| POST | `/api/v1/vacations/{id}/review/` | Approve/reject leave (+ feedback) |

## Multi-tenancy & SOLID notes

- **Tenant isolation**: `TenantQuerysetMixin` filters every domain QuerySet by `request.user.farm`.
- **RBAC**: permission classes in `apps/accounts/permissions.py` (`IsSuperAdmin`, `IsFarmOwner`, `IsManager`, `IsWorker`, …).
- **Open/Closed**: task transitions live in `Task.ALLOWED_TRANSITIONS` — extend the map instead of scattering conditionals.
- **Suspended farms**: blocked at login and via `FarmIsActive` permission.
- **Leave hierarchy**: managers cannot approve their own (or other managers’) leave — owner only.

## Switching to PostgreSQL / MySQL

Edit `backend/.env`:

```env
DB_ENGINE=postgres
POSTGRES_DB=farm_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
```

or `DB_ENGINE=mysql` with the `MYSQL_*` variables. Install the matching driver (`psycopg2-binary` / `mysqlclient`), then re-run `migrate`.

## Thesis talking points

1. Shared-database multi-tenancy with `farm_id` row isolation.
2. JWT auth with role/farm claims and suspended-tenant enforcement.
3. Explicit RBAC matrix mapped to UI routes and API permissions.
4. Quality-control task lifecycle with verification and 1–5 star ratings.
5. SaaS subscription packages at registration + SuperAdmin MRR / plan distribution.
6. Bilingual product UI (English / Albanian) with persisted locale.
7. HR leave workflow: workers + managers request leave; owner is the final approver for manager leave.
