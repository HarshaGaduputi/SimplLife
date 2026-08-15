# API Reference

All routes live under `/api`. Responses use a standard envelope:

```ts
{ success: true;  ...payload }   // 2xx
{ success: false; error: string; issues?: string[] }  // 4xx / 5xx
```

## Implementation Notes

Internally, every endpoint flows through a strict layered architecture:

```
HTTP Request
  →  Routes (thin 1-liner wires: method + path → middleware → controller)
  →  Validation middleware (Zod schemas from api/validators/*)
  →  Controllers (request/response only; never call DB or repositories)
  →  Services (all business logic, ownership checks, orchestration)
  →  Repositories (data access; wrappers around MemoryDatabase in api/db.ts)
```

This separation guarantees that API contracts (documented below) remain completely stable even as business logic or the persistence layer changes. Endpoint signatures, request body shapes, and response payloads are identical to the pre-refactor implementation — no frontend changes required.

## Authentication

### `POST /api/auth/register`
Create a new user account.

**Body**:
```ts
{ name: string; email: string; password: string }
```

**Response (201)**:
```ts
{ success: true; token: string; user: User }
```

### `POST /api/auth/login`
Authenticate existing user.

**Body**:
```ts
{ email: string; password: string }
```

**Response (200)**:
```ts
{ success: true; token: string; user: User }
```

### `GET /api/auth/me`
Get current user from JWT.

**Auth**: Bearer token

### `PATCH /api/auth/me`
Update user profile.

**Auth**: Bearer token
**Body**:
```ts
{ name?: string; digestEmailsEnabled?: boolean }
```

### `POST /api/auth/logout`
Server-side logout (client discards token).

**Auth**: Bearer token

## Groups

### `GET /api/groups`
List all groups for authenticated user.

### `POST /api/groups`
Create a new group.

**Body**: `{ name: string }`

### `PATCH /api/groups/:id`
Rename a group.

**Body**: `{ name?: string }`

### `DELETE /api/groups/:id`
Soft-delete a group (moves to trash).

## Tasks (by group)

### `GET /api/groups/:groupId/tasks`
List tasks (with subtasks) inside a group.

### `POST /api/groups/:groupId/tasks`
Create a new task in a group.

**Body**:
```ts
{
  title: string;
  description?: string | null;
  order?: number;
  templateId?: string | null;
  priority?: 'high' | 'medium' | 'low' | 'none' | null;
  dueDate?: string | null;
}
```

## Tasks (individual)

### `PATCH /api/tasks/:id`
Update task fields (title, description, completed, priority, dueDate, order, templateId).

### `DELETE /api/tasks/:id`
Soft-delete a task.

### `PATCH /api/tasks/:id/complete`
Mark task completed + set `completedAt`.

### `PATCH /api/tasks/:id/uncomplete`
Revert completion + clear `completedAt`.

### `GET /api/tasks/upcoming`
Return tasks due today (used by notification banner).

### `POST /api/tasks/:id/ai-split`
AI-assisted subtask generation. Falls back to smart keyword-based subtasks if no LLM configured.

## Subtasks

### `POST /api/tasks/:taskId/subtasks`
Create a subtask.

### `PATCH /api/tasks/subtasks/:id`
Update subtask title / completion / order.

### `DELETE /api/tasks/subtasks/:id`
Soft-delete a subtask.

## Templates

### `GET /api/templates`
Public — list the 10 built-in task templates.

### `POST /api/templates/apply`
Apply a template to a group: creates 1 main task + N subtasks.

**Body**:
```ts
{ templateId: string; groupId: string; mainTaskName: string }
```

## Trash

### `GET /api/trash`
List soft-deleted groups / tasks / subtasks.

### `POST /api/trash/restore/:type/:id`
Restore (undeletes) a trashed item. `type ∈ { group, task, subtask }`.

### `DELETE /api/trash/item/:type/:id`
Permanently delete a single trashed item.

### `DELETE /api/trash/empty`
Permanently clear the entire trash.

## Activity Log

### `GET /api/activity?limit=50&offset=0`
Paginated activity log of audited changes.

## Export / Import

### `GET /api/export`
Download a JSON snapshot of the user's data.

### `POST /api/import`
Restore / merge a previously exported snapshot.

## State Sync

### `PATCH /api/state/sync`
Idempotent bulk sync (client → server). Used as a safety fallback.

## Contact

### `POST /api/contact`
Public — send a support/contact message.

**Body**:
```ts
{ name: string; email: string; subject: string; message: string }
```

## Health

### `GET /api/health`
Public — returns `{ success: true, app: "SimplLife" }`.

## Error Handling

HTTP status codes mirror semantics:
- `400` — validation errors (`issues` array populated)
- `401` — missing / invalid token
- `403` — permission denied
- `404` — route or entity not found
- `429` — rate-limited
- `5xx` — server-side failures

All error bodies use the standard failure envelope so the client's `HttpError` always exposes a user-safe `message` and optional `issues[]`.
