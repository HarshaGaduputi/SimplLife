# Database

## Storage Backends

Two backends exist for the data-access layer in `api/db.ts`:

1. **PostgreSQL** (production) — used when `DATABASE_URL` is set.
2. **In-memory store** (development/demo) — JavaScript Maps when `DATABASE_URL` is absent.

Both backends implement the same repository-style interface, so routes/services are backend-agnostic.

## Schema

### `users`
| Column         | Type    | Notes                                    |
|----------------|---------|------------------------------------------|
| `id`           | uuid PK |                                          |
| `name`         | text    | Display name                             |
| `email`        | text    | Unique, lowercase                        |
| `password_hash`| text    | bcrypt                                   |
| `digest_emails_enabled` | boolean | default `true`                |
| `created_at`   | timestamptz |                                    |

### `groups`
| Column         | Type    | Notes                                    |
|----------------|---------|------------------------------------------|
| `id`           | uuid PK |                                          |
| `user_id`      | uuid FK | → users.id                               |
| `name`         | text    |                                          |
| `order`        | int     | User-ordered position                    |
| `deleted_at`   | timestamptz NULL | Soft-delete flag                  |
| `created_at`   | timestamptz |                                    |
| `updated_at`   | timestamptz |                                    |

### `tasks`
| Column         | Type    | Notes                                    |
|----------------|---------|------------------------------------------|
| `id`           | uuid PK |                                          |
| `group_id`     | uuid FK | → groups.id                              |
| `title`        | text    |                                          |
| `description`  | text NULL |                                         |
| `completed`    | boolean |                                          |
| `completed_at` | timestamptz NULL |                                    |
| `order`        | int     | Intra-group ordering                     |
| `template_id`  | text NULL | Tracks which template was applied   |
| `priority`     | enum NULL | `high \| medium \| low \| none`     |
| `due_date`     | date NULL |                                         |
| `deleted_at`   | timestamptz NULL |                                          |
| `created_at`   | timestamptz |                                    |
| `updated_at`   | timestamptz |                                    |

### `subtasks`
| Column         | Type    | Notes                                    |
|----------------|---------|------------------------------------------|
| `id`           | uuid PK |                                          |
| `task_id`      | uuid FK | → tasks.id                               |
| `title`        | text    |                                          |
| `completed`    | boolean |                                          |
| `order`        | int     | Intra-task ordering                      |
| `deleted_at`   | timestamptz NULL |                                          |
| `created_at`   | timestamptz |                                    |
| `updated_at`   | timestamptz |                                    |

### `activity_logs`
| Column         | Type    | Notes                                    |
|----------------|---------|------------------------------------------|
| `id`           | uuid PK |                                          |
| `user_id`      | uuid FK |                                          |
| `action`       | text    | e.g. `"create_task"`, `"complete_task"`  |
| `entity_type`  | enum    | `group \| task \| subtask \| template \| user` |
| `entity_name`  | text    | Snapshot of the display name at time of action |
| `detail`       | text NULL | Extra context                          |
| `created_at`   | timestamptz |                                    |

### `templates`
Built-in catalog — 10 static rows seeded on startup.

## Soft-Deletes (Trash)

- `deleted_at` columns: all `SELECT` queries filter `deleted_at IS NULL`.
- Deletes set `deleted_at = NOW()` instead of `DELETE`.
- Cron job permanently removes rows older than 30 days (see `api/cron.ts`).
- `GET /api/trash` explicitly queries `deleted_at IS NOT NULL`.

## Indexes (PostgreSQL)
- `users(email)` — unique
- `groups(user_id, order)` — composite for ordering
- `tasks(group_id, order)` — task listing
- `tasks(due_date)` — upcoming queries
- `subtasks(task_id, order)` — subtask listing
- `activity_logs(user_id, created_at DESC)` — paginated log view

## Export Format

The JSON export (`GET /api/export`) shape matches the `ExportData` interface in `shared/types.ts`:

```ts
{
  exported_at: string;                  // ISO-8601
  user: { name: string; email: string };
  groups: Array<{
    name: string;
    position: number;
    tasks: Array<{
      name: string;
      description: string | null;
      priority: PriorityLevel | null;
      due_date: string | null;
      is_completed: boolean;
      position: number;
      subtasks: Array<{ name: string; is_completed: boolean; position: number }>;
    }>;
  }>;
}
```

## Migrations

*Placeholder — migrations folder / migration runner will live under `database/migrations`.*
