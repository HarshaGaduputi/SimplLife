# Features

## Core

### 🔐 Authentication
- Register / login / logout with JWT-based sessions
- `useAuthStore` on the client manages hydration on page reload
- Token persisted in `localStorage` under `simpllife-token`
- `ProtectedRoute` wrapper guards dashboard routes

### ✅ Task Management
- **Groups** (people / categories / projects) as the top-level container
- **Tasks** inside groups with: title, description, priority, due date, order
- **Subtasks** per task with independent completion + ordering
- Drag-free reordering via `order` column (future: drag-and-drop primitives)
- Soft-delete → **Trash** with 30-day retention, restore, and permanent delete
- **Undo / Redo** — local history stack of up to 50 snapshots

### 📚 Templates
10 built-in task templates (Blog Writing, Event Planning, Study Session, Bug Fix, Shopping Run, Client Task, Health & Fitness, Reading List, Weekly Goals, Work Project).

Applying a template to a group creates:
- 1 main task named by the user
- N subtasks pre-filled from the template

A task may carry at most **one** applied template at a time.

### 📅 Calendar
Month view (`/dashboard/calendar`) visualizes tasks by due date:
- Tasks color-coded by priority on the grid
- Today highlighted
- Click-free scrolling month-by-month

### 🔎 Smart Search & Filters
- `SmartSearchBar` for fuzzy live search across titles + descriptions
- Keyword-based template suggestion (e.g. typing "blog" suggests the Blog Writing template)
- Filter controls: priority, due-date range (overdue/today/upcoming), group, status (active/completed)

### 🔔 Notifications
- Browser Notification API integration (permission banner on dashboard)
- Scheduled 09:00 reminders for tasks due today
- In-app toasts for success / error / info events with 5.5s default duration
- Dismissible + optional undo-action on destructive toasts

### 🧠 AI Auto-Split
`POST /api/tasks/:id/ai-split`:
- LLM-powered subtask decomposition when configured
- Falls back to keyword/rule-based subtask generation so features never degrade

### 📋 Activity Log
Chronological audit of actions performed:
- Creates, edits, completes, restores
- 50-item pagination, available on `/settings` page

### ⚙️ Settings
- Update profile name
- Toggle daily digest emails
- Export all data as JSON
- Import data from JSON export
- Activity log viewer

### 🎨 Theming
- Light / dark modes toggled via floating circular button (44px, bottom-right)
- CSS custom properties only — no hex values in components
- Theme persisted in `localStorage` under `simpllife-theme`
- Respects saved theme on first paint

### ⌨️ Keyboard Shortcuts
- `Cmd/Ctrl+Z` / `Cmd/Ctrl+Y` — Undo / Redo on dashboard
- `Cmd/Ctrl+D` when task focused — open description editor
- `?` — open shortcuts modal

### 📇 Contact Page
- Form with client + server-side validation
- FAQ accordion section with 5 curated Q&As
- Auto toast + success panel on submission

## Non-Functional

| Concern              | Implementation                                   |
|----------------------|--------------------------------------------------|
| Security             | Helmet CSP, bcrypt password hashing, JWT         |
| Rate limiting        | 200 req/min general; 20 req/10min auth          |
| CORS                 | Credential-free; configurable `CORS_ORIGIN`     |
| Error handling       | Centralized express error middleware → client `HttpError` |
| Responsiveness       | Sidebar visible ≥1024px, tablet rail, mobile hamburger |
| Accessibility        | Focus outlines, ARIA labels, semantic HTML, good contrast |
