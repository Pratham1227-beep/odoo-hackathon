---
name: folder-scaffold
description: Scaffolds React/Vite frontend projects and feature modules using Yusu's personal "feature-first" folder architecture (feature folders each with components, pages, services, and optionally data/hooks/layout; a shared folder with components/ui, services, utils; and a flat store folder for Zustand). Use this whenever the user is starting a new frontend project, adding a new feature/module/page to an existing React project, asking to "set up the folder structure," "scaffold a project," reorganize a messy frontend, or is in a hackathon and needs a working project skeleton fast. Also use it any time the user references their usual/standard/personal folder structure for frontend work, even without naming it explicitly.
---

# Frontend Feature-First Scaffold

Reproduces the folder/file architecture used across Yusu's shipped frontend projects
(Neargrab, MESMS frontend, etc.) so every new project or new feature looks and is
organized the same way — for daily work AND for hackathon speed.

## The pattern, in one paragraph

Everything domain-specific lives under `src/features/<feature-name>/`, sliced into
`components/`, `pages/`, `services/` (always present) plus `data/`, `hooks/`, `layout/`
(only when actually needed). Anything reused across 2+ features lives under `src/shared/`
(`components/ui/` for design-system primitives, `services/` for base API clients,
`utils/` for pure helpers). Global state is flat files in `src/store/`, one per domain,
named `use<Domain>Store.js` (Zustand). `src/router.jsx` is the single source of truth
for routes. Root `src/components/` stays almost empty — only truly app-wide things
like SEO/structured-data wrappers belong there.

Read `references/example-tree.md` for the full annotated real-world tree and rules of
thumb for where new files go. Read `references/file-templates.md` for boilerplate
content of each file type before writing files by hand.

## Workflow

### 1. Figure out the scope
Pick the right mode based on what the user is asking for — don't ask unless genuinely
ambiguous, just proceed with the best-fit interpretation and say what you assumed:

- **Brand-new project** ("start a new app", "hackathon project", "scaffold a frontend
  for X") → Project mode.
- **New feature/module in an existing project** ("add a wishlist feature", "create the
  billing section") → Feature mode.
- **Reorganizing an existing messy project into this pattern** → Refactor mode.

### 2a. Project mode (new project / hackathon)
Run `scripts/scaffold_project.sh <project-dir> --features "feat1,feat2,feat3"` — infer
the feature list from what the user described (e.g. "an app for booking gym slots" →
features like `auth`, `booking`, `dashboard`). This single command:
- bootstraps Vite + React if no project exists yet,
- installs `react-router-dom`, `zustand`, `axios`, `clsx`, `tailwind-merge`,
- lays down `shared/`, `store/`, `components/`, and each requested feature folder,
- writes starter `App.jsx`, `router.jsx`, `apiClient.js`, `cn.js`.

For hackathons: don't ask about test setups, CI, or linting config unless asked — get a
running skeleton fast, then start filling in the first feature's actual pages.

### 2b. Feature mode (adding to an existing project)
Run `scripts/scaffold_feature.sh <feature-name> --pages "Page1,Page2" [--hooks] [--data] [--layout]`.
Decide the flags from context:
- `--hooks` if the feature has non-trivial client-side logic worth extracting (filters,
  form state machines, debounced search, etc.) — see `search` feature's `useSearchFilters.js`.
- `--data` if there's no backend yet and you need mock/temp JSON to build against — see
  `explore/data/temp.json`.
- `--layout` only for a feature big enough to be a mini-app with its own header/sidebar
  (like `shopkeeper`) — most features don't need this.

After scaffolding, always:
1. Fill in the generated page(s)/service(s) with real content for what the user asked for.
2. Register each new page's route in `src/router.jsx` (template in `references/file-templates.md`).
3. If the feature needs global state, add `store/use<Feature>Store.js` (template provided).
4. If a new cross-feature reusable piece emerges, put it in `shared/components/` instead
   of duplicating it inside the feature.

### 2c. Refactor mode (messy project → this pattern)
1. `view` the existing `src/` tree.
2. Classify every file using the "rules of thumb" in `references/example-tree.md`
   (feature-specific vs shared vs global-state vs pure-util).
3. Propose the target tree to the user before moving anything — refactors are
   destructive, confirm the mapping first, especially import path rewrites.
4. Move files, then fix all relative imports (search + fix, don't leave broken imports).

## Naming conventions (apply automatically, don't ask)
- Feature folder names: `kebab-case` or single lowercase word (`cart`, `shop`, `shopkeeper`).
- Components: `PascalCase.jsx`.
- Pages: `<Name>Page.jsx`, one per route.
- Services: `<feature>Service.js` (camelCase, singular file per feature, not per endpoint).
- Hooks: `use<Name>.js`.
- Stores: `use<Domain>Store.js`, always flat in `src/store/`, never nested per feature.
- Utils: camelCase, pure functions only, co-locate a `.test.js` if the user wants tests.

## Things to avoid
- Don't create `data/`, `hooks/`, or `layout/` folders speculatively — only when there's
  actual content for them (empty scaffolding clutter is exactly what this pattern avoids).
- Don't put feature-specific components in `shared/` "just in case" — wait until a second
  feature actually needs it, then promote it.
- Don't nest state management inside feature folders — it breaks the "one flat store/
  folder" convention that makes global state easy to find.
- Don't skip registering new pages in `router.jsx` — a page with no route is a dead file.

## Bundled resources
- `scripts/scaffold_project.sh` — bootstrap a brand-new project (hackathon-fast, safe re-run, never overwrites existing files).
- `scripts/scaffold_feature.sh` — add one feature module to an existing project.
- `references/example-tree.md` — full annotated real project tree + placement rules of thumb.
- `references/file-templates.md` — boilerplate for every file type (page, component, service, store, hook, ui primitive, router entry, apiClient, cn util).
