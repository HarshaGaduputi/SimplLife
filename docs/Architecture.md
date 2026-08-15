# Architecture

## Overview

SimplLife is a full-stack SaaS task management application built with a React/TypeScript frontend and a Node.js/Express/PostgreSQL backend.

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Client (React)                       │
├─────────────┬──────────┬───────────┬─────────────────────┤
│   App       │ Features │ Shared UI │   State (Zustand)   │
│  Shells     │ Auth     │ Components│                     │
│  Routing    │ Dashboard│  Layouts  │  authStore          │
│             │ Tasks    │  Forms    │  themeStore         │
│             │ Calendar │  Cards    │  toastStore         │
│             │ Templates│  Buttons  │  filtersStore       │
│             │ Settings │  Inputs   │  tasksStore         │
│             │ Trash    │  Modals   │                     │
└─────────────┴──────────┴───────────┴─────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  API Service Layer │
                    │  (HTTP client,     │
                    │   auth headers,    │
                    │   error handling)  │
                    └────────┬───────────┘
                             │ HTTPS/REST
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   Server (Express)                       │
├─────────────┬──────────┬───────────┬─────────────────────┤
│  Routes     │Controllers│ Services  │  Repositories (DB) │
│  (thin)     │  (thin)  │  (logic)  │  (PostgreSQL /     │
│             │          │           │   in-memory mock)   │
└─────────────┴──────────┴───────────┴─────────────────────┘
```

## Frontend Architecture

### Feature-Based Structure

```
src/
├── app/                    # App-wide concerns
│   ├── App.tsx             # Root component + routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + theme variables
├── features/               # Vertical feature slices
│   ├── auth/
│   ├── dashboard/
│   ├── tasks/
│   ├── calendar/
│   ├── notifications/
│   ├── templates/
│   ├── search/
│   └── settings/
├── components/             # Shared reusable UI
│   ├── ui/                 # Atomic UI primitives
│   ├── layouts/
│   └── ...
├── hooks/                  # Shared custom hooks
├── services/api/           # API service modules
├── stores/                 # Zustand state stores
├── types/                  # Shared TypeScript types
├── constants/              # App-wide constants
├── utils/                  # Pure utility functions
├── assets/                 # Static assets
└── styles/                 # Additional style sheets
```

### Design Principles

- **DRY**: No duplicated API calls, components, or utilities
- **SOLID**: Single-responsibility stores and services
- **KISS**: Avoid over-abstraction; keep state close to use
- **Separation of Concerns**: UI components never call `fetch` directly

### State Management

Multiple focused Zustand stores (instead of one monolith):

| Store | Responsibility |
|-------|---------------|
| `authStore` | User session, token, hydration |
| `themeStore` | Light/dark theme, persistence |
| `toastStore` | Toast notification queue |
| `filtersStore` | Search query + active filters |
| `tasksStore` | Groups, tasks, subtasks, undo/redo history |
| `uiStore` | Sidebar state, modal visibility (kept small) |

### API Layer

All HTTP calls go through `src/services/api/client.ts` which centralizes:
- `fetch` invocation
- Authorization header injection
- Query string construction
- JSON parsing + error normalization
- Future interceptor / token refresh hooks

Feature-specific service modules (`authService`, `tasksService`, etc.) wrap typed endpoints.

## Backend Architecture

### Layered Structure (Controller → Service → Repository)

The backend follows a strict 3-layer architecture with a validation middle layer:

1. **Routes** (`api/routes/*.routes.ts`) — Thin one-liners that wire HTTP method + path → middleware chain → controller method. No business logic.
2. **Validators** (`api/validators/*.validator.ts`) — Zod schemas applied as middleware via `validate(schema)` before controllers run.
3. **Controllers** (`api/controllers/*.controller.ts`) — Thin request/response handlers. Extract params/body/query, invoke one service method, send JSON envelope `{ success, ...payload }`, pass all errors to `next(err)`.
4. **Services** (`api/services/*.service.ts`) — All business rules, ownership checks, orchestration across repositories. Examples: recursive cascading, AI split (OpenAI + fallback), template application, import validation, state sync transformation.
5. **Repositories** (`api/repositories/*.repository.ts`) — Data access layer. Each repository wraps methods on the `MemoryDatabase` (in-memory `Map`-based store via `api/db.ts`). Services call repositories — never the DB class directly.

```
api/
├── index.ts            # Vercel serverless entry (exports Express handler)
├── server.ts           # Node standalone entry (listen on PORT + initCronJobs)
├── app.ts              # Express app assembly (CORS, Helmet, rate-limit, routes, 404, errorHandler)
├── cron.ts             # Background jobs (daily trash auto-empty, daily digest check)
├── db.ts               # MemoryDatabase class (in-memory data store + persistence methods)
├── config/
│   └── index.ts        # Centralised env-aware config (JWT, CORS, rate-limit, OpenAI, trash)
├── routes/             # Thin route definitions (each file is *.routes.ts, 1-liner wires)
│   ├── auth.routes.ts
│   ├── groups.routes.ts
│   ├── tasks.routes.ts
│   ├── templates.routes.ts
│   ├── contact.routes.ts
│   ├── trash.routes.ts
│   ├── activity.routes.ts
│   ├── exportImport.routes.ts
│   └── stateSync.routes.ts
├── controllers/        # Request/response only — NEVER touches repositories or DB
│   ├── auth.controller.ts
│   ├── group.controller.ts
│   ├── task.controller.ts
│   ├── template.controller.ts
│   ├── contact.controller.ts
│   ├── trash.controller.ts
│   ├── activity.controller.ts
│   ├── exportImport.controller.ts
│   └── stateSync.controller.ts
├── services/           # Pure business logic — calls repositories only
│   ├── auth.service.ts           # bcrypt + JWT registration/login flow
│   ├── group.service.ts          # Ownership guard + CRUD
│   ├── task.service.ts           # Ownership checks (ensureOwnsTask/Subtask), upcoming filter, AI split
│   ├── template.service.ts       # Template application: 1 task + N subtasks atomically
│   ├── trash.service.ts          # Type validation + restore/empty/permanent-delete
│   ├── activity.service.ts       # Pagination param sanitisation
│   ├── contact.service.ts        # Contact message relay
│   ├── exportImport.service.ts   # Body-shape validation + import/export orchestration
│   ├── stateSync.service.ts      # Client shape → ExportData transformation
│   └── seedTemplates.service.ts  # SEED_TEMPLATES constant + accessor (moved from api/lib)
├── repositories/       # Data access wrappers around getDb().method(...)
│   ├── user.repository.ts
│   ├── group.repository.ts
│   ├── task.repository.ts
│   ├── subtask.repository.ts
│   ├── template.repository.ts
│   ├── trash.repository.ts
│   ├── activity.repository.ts
│   ├── contact.repository.ts
│   └── exportImport.repository.ts
├── validators/         # Zod schemas (one per feature domain)
│   ├── auth.validator.ts
│   ├── group.validator.ts
│   ├── task.validator.ts
│   ├── template.validator.ts
│   ├── contact.validator.ts
│   ├── trash.validator.ts
│   └── activity.validator.ts
├── middleware/
│   ├── auth.ts         # requireAuth(), signToken(), verifyToken(), AuthRequest type
│   ├── validate.ts     # validate(schema, location?) → Zod safeParse middleware wrapper
│   └── errorHandler.ts # Centralised error → { success, error, issues? } envelope
├── types/
│   └── index.ts        # Re-exports shared types (mirrors shared/types.ts)
├── utils/
│   ├── logger.ts       # Structured 4-level logger (info/warn/error/debug)
│   └── helpers.ts      # uid(), now(), ApiError class (statusCode + issues)
└── models/             # (Currently unused; reserved for future Mongoose/TypeORM models)
```

### Request Flow (typical authenticated endpoint)

```
HTTP PATCH /api/tasks/:id
  ↓
express.json() parser
  ↓
requireAuth middleware  →  extracts Bearer token → verifies JWT → loads user → sets req.userId
  ↓
validate(UpdateTaskSchema)  →  Zod safeParse(req.body) → on failure: next(ApiError(400, issues))
  ↓
taskController.update(req, res, next)
  ↓  (extracts req.params.id, req.body, req.userId)
TaskService.update(userId, taskId, patch)
  ↓  (business rules: ownership check via group→userId, delegated to repository)
  taskRepository.update(taskId, patch)
    ↓
  getDb().updateTask(...)  →  in-memory Map mutation + activity log + timestamping
  ↓
Controller: res.status(200).json({ success: true, task })
  ↓
(If any step throws → next(err) → errorHandler middleware → { success:false, error, issues })
```

### API Endpoints

See [API.md](./API.md) for the endpoint catalog. Contracts are unchanged from the previous monolithic-route implementation.

### Database

See [Database.md](./Database.md) for schema and data-access notes.

**Current implementation note:** The backend ships with an in-memory `MemoryDatabase` in `api/db.ts` (using `Map<id, Entity>`) rather than PostgreSQL. The repository layer abstracts this so swapping to PostgreSQL/TypeORM/Mongoose later only requires changing repository implementations — services/controllers/routes are unaffected.

## Theming

CSS custom properties on `<html>` (`theme-light` / `theme-dark`) drive the entire color system. No hard-coded hex values in components — only semantic variables.

Key CSS variables:
- `--color-page` / `--color-surface` / `--color-panel` — background tiers
- `--color-text` / `--color-text-strong` / `--color-text-muted` — text tiers
- `--color-primary` / `--color-primary-hover` — action colors
- `--color-border` / `--color-border-subtle` — separator tiers

## Deployment

- Frontend + backend bundled together by Vite
- Backend can deploy as serverless (Vercel) via `api/index.ts` or standalone via `npm start`
- Environment variables documented in `.env.example`
