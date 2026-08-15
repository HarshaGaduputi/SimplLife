# Roadmap

Short, medium, and long-term directions. Nothing here is committed — it is a planning reference.

## Phase 1: Core Stability (Current ✅ — done in current refactor)
- [x] Feature-based folder structure
- [x] Modular API service layer (no direct `fetch` in components)
- [x] Remove duplicate API code paths
- [x] Focused Zustand stores (split monolith)
- [x] Standardized naming (folders, files, components, hooks)
- [x] Design-system CSS components + theming
- [x] Zero lint / type / build errors
- [x] Docs scaffold (Architecture / API / Database / Features)
- [x] Reusable UI primitives

## Phase 2: Feature Enhancements
- [ ] **Workspaces / multi-tenant teams** — share groups with other users, role-based access
- [ ] **Recurring tasks** — cron-style due date rules, auto-generate on cadence
- [ ] **Subtask progress roll-up** — parent task progress bar, auto-complete
- [ ] **Drag-and-drop** reorder for groups, tasks, subtasks (dnd-kit)
- [ ] **Task comments / notes** — threaded discussion per task
- [ ] **Attachments** — upload via object storage (S3/R2), preview in card
- [ ] **Calendar 2-way sync** — Google Calendar / Outlook import + export (webhooks)
- [ ] **Advanced filtering** — saved filter presets, multi-select
- [ ] **Task dependencies** — "blocked by" graph, gantt-style view
- [ ] **Dashboard widgets** — user-configurable grid of cards

## Phase 3: Collaboration & Automation
- [ ] **Realtime sync** — WebSocket / SSE for concurrent edits
- [ ] **Comments & mentions** — @mention teammates, in-app inbox
- [ ] **Rules engine / automations** — "when task is due today, move to Today focus + send push"
- [ ] **Integrations** — Slack, Linear, GitHub issues, Notion, Todoist, Apple Reminders
- [ ] **Public share links** — read-only task lists for stakeholders

## Phase 4: Platform & Enterprise
- [ ] **SSO / SAML** — enterprise sign-in
- [ ] **Audit log export** — CSV + API access for SOC2 traceability
- [ ] **Data residency options** — region-specific Postgres fleets
- [ ] **Admin / billing dashboard** — seat-based plans, invoices, usage
- [ ] **Rate limit / quota tuning** — per-plan limits for API, storage, AI usage
- [ ] **Offline-first client** — service worker + conflict-free CRDT merges

## AI-Related
- [ ] **Smart due dates** — LLM suggestion based on description + history
- [ ] **Task auto-assignment** — team skill-match recommendations
- [ ] **Natural language entry** — "Plan Jenny's birthday dinner next Sat" → decomposed group + tasks
- [ ] **Summaries & standups** — daily / weekly email digests with AI-generated highlights

## Infrastructure
- [ ] **Migrations runner** (Atlas / Kysely migrator) replacing ad-hoc seed
- [ ] **CI / CD** — GitHub Actions: lint, type-check, build, test, deploy
- [ ] **Docker Compose** — local Postgres + Redis + MinIO for object storage
- [ ] **Monitoring / tracing** — OpenTelemetry + structured logging
- [ ] **E2E tests** — Playwright across auth, CRUD, trash, templates, export/import
- [ ] **Visual regression** — Chromatic / Percy snapshots for component library
