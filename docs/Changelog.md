# Changelog

All notable changes to this project are documented here. The format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed — Architecture & Code Quality
- **API layer consolidation**: removed the legacy `src/lib/api.ts` monolithic client (1 file). All components now import feature services from `src/services/api/` (`authService`, `groupsService`, `tasksService`, `templatesService`, `trashService`, `contactService`, `activityService`, `exportService`, `stateService`).
- **TOKEN_KEY / THEME_KEY bugfix**: the legacy layer stored tokens under `"tasknest-token"` / theme under `"tasknest-theme"`, while the canonical constants use `"simpllife-token"` / `"simpllife-theme"`. Migrating to the new services layer unifies these on the canonical keys.
- **ESLint `@typescript-eslint/no-unused-vars`**: configured to allow `_`-prefixed identifiers for unused callback args / caught errors, reducing noisy suppressions while keeping the rule strict.
- **Fixed relative import paths** in `src/services/api/*.service.ts` (`../../../../shared/types` → `../../../shared/types`).
- **Removed missing babel plugin** reference to `babel-plugin-react-dev-locator` in `vite.config.ts` (was breaking production build).
- **Replaced dynamic imports** in `exportService.exportData()` with static imports, eliminating the Rollup warning about mixed static + dynamic module usage.

### Removed
- Dead file: `src/lib/api.ts` (100% duplicate of the services layer, and carrying stale localStorage keys).
- Empty directory: `src/lib/`.

### Fixed — Lint / Type Errors
- `@typescript-eslint/no-explicit-any`:
  - `TaskCard.tsx` ref casts typed as `React.RefObject<HTMLElement>` instead of `any`.
  - `CalendarView.tsx` store setter cast typed as `Group[]` instead of `any`.
  - `api/routes/stateSync.ts`: added `SyncGroup`, `SyncTask`, `SyncSubtask` interfaces with optional fields to replace 3 `any` lambdas.
- `@typescript-eslint/no-unused-vars`:
  - Removed unused `CalendarIcon` import in `CalendarView.tsx`.
  - Removed unused catch var in `Templates.tsx` load.
  - Removed unused `created` variable from `templatesService.apply()` result.
  - Removed unused catch var in `Trash.tsx` `handleRestore`.
  - Removed unused `X` icon import in `NotificationBanner.tsx`.
  - Removed unused `tasksService` import in `Sidebar.tsx`.
  - Removed unused proxy callback args in `vite.config.ts` (kept meaningful ones, prefixed discardable with `_`).
- **Zero errors, 4 warnings remain** (all `react-hooks/exhaustive-deps` intentional suppressions).

### Documentation
- Created `docs/` directory with:
  - `Architecture.md` — system diagram, frontend + backend structure, theming notes.
  - `API.md` — endpoint catalog with request/response shapes.
  - `Database.md` — schema, soft-delete mechanism, indexes, export format.
  - `Features.md` — feature catalog + non-functional matrix.
  - `Roadmap.md` — Phase 1–4 directional backlog.
  - `TODO.md` — concrete actionable backlog items.
  - `Changelog.md` — this file.

### Build Verification
- `npm run type-check` — **0 errors**
- `npm run lint` — **0 errors** (4 warnings)
- `npm run build` — **success**, 1674 modules transformed.

---

## Earlier History

*Prior to this refactor, changes were not formally tracked in a changelog. See git history for the pre-refactor baseline.*
