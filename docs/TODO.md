# TODO

A running backlog of concrete actionable items not yet completed. Updated as work lands.

## High Priority

### Build & Config
- [ ] Add Prettier config (currently only a `format` script without rules file)
- [ ] Add `test` command + test runner (Vitest + Testing Library)
- [ ] Add GitHub Actions workflow (lint, type-check, build on PRs)
- [ ] Add `docker-compose.yml` for local Postgres + Redis
- [ ] Add migration tool + `database/migrations/` folder

### Frontend
- [ ] Finalize `components/ui/` primitives (Button, Card, Input, Select, Badge, Avatar, Dialog, Tooltip, Toast, Loader, Empty, Error, Pagination)
- [ ] Extract repeated inline `style={{ background: "var(--color-...)" }}` into reusable class names / Tailwind utilities
- [ ] Lazy-load the Dashboard + Calendar route bundles (`React.lazy`)
- [ ] Memoize `TaskCard` and `Subtask` rows with `React.memo` where props are stable
- [ ] Add proper `Transition` component for page transitions instead of raw `fade-in-up`
- [ ] Create reusable `Form` wrapper with controlled `Field` + `FieldError` components
- [ ] Refactor Dashboard keyboard-shortcut effect into a `useKeyboardShortcuts()` hook

### State
- [ ] Split `useUIStore` into `useThemeStore`, `useToastStore`, `useFiltersStore`, `useAppUIStore` (sidebar, modals)
- [ ] Add `useCalendarStore` for calendar-level state instead of component-local
- [ ] Persist `filtersStore` state to `localStorage` for dashboard refresh
- [ ] Add optimistic-update wrappers (commit → API rollback on error) to replace manual revert code in `TaskCard`

### Backend
- [ ] Move query / mutation logic out of `api/routes/*.ts` into `controllers/` → `services/` → `repositories/` layers
- [ ] Add Zod validators per endpoint in `validators/`
- [ ] Add structured logger (pino / winston) in `logger/`, remove raw `console.log` from server code
- [ ] Centralize env access in `config/index.ts` and validate at boot with Zod
- [ ] Extract the 10 built-in templates from `seedTemplates.ts` into static JSON under `database/seeds/`
- [ ] Add request-ID middleware and propagate it into logs

### Tests
- [ ] Auth flow e2e: register → login → create group → create task → delete
- [ ] Templates: browse → apply → verify group now contains tasks
- [ ] Trash: delete → restore → empty
- [ ] Export → import round-trip data fidelity
- [ ] Unit tests for `utils/date.ts`, `utils/string.ts`, `utils/cn.ts`

## Medium Priority
- [ ] Add proper 404 + 500 pages (marketing-style, not just `<Navigate to="/">`)
- [ ] Server-side rendering consideration for `/about`, `/contact`, `/templates` marketing pages (SEO)
- [ ] Service worker + offline cache for app shell
- [ ] `<img />` optimization via `@unpic/react` or equivalent
- [ ] Add robots.txt + sitemap.xml
- [ ] Accessibility audit (axe-core) in CI
- [ ] Migrate `index.html` meta tags (OG, Twitter) to dynamic React Helmet or `<title>` context

## Low Priority / Nice-To-Have
- [ ] Storybook for shared component library
- [ ] i18n framework wiring (react-i18next) with English default catalog
- [ ] Bundle-size budget check in CI (webpack-bundle-analyzer / rollup visualizer)
- [ ] PWA install manifest
