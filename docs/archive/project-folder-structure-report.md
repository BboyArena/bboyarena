# Project Folder Structure Report

> Archived report. This analysis predates the current application layout. Use the [project specification](../../PROJECT_SPEC.md) and [current architecture](../current-architecture.md) for active structure and rules.

Date: 2026-06-24

Scope: folder structure only. No files were moved, deleted, or refactored.

## Summary

The project is currently in a transitional but understandable state:

- The website still lives in the historical root app: `src/`, `public/`, `astro.config.mjs`.
- The standalone game host lives in `apps/game/`.
- The actual game runtime still lives in `src/game/`.
- `apps/website/` exists only as a placeholder and is not used by scripts, imports, or config.
- `packages/shared/` exists only as a placeholder and is not used by code yet.
- `src/components/game/` is now a legacy compatibility layer that re-exports from `src/game`.

The safest short-term approach is to keep the current structure, remove only clearly empty/transitional placeholders when desired, and continue extracting the game in small steps.

## Folder Tree

Generated to depth 3, excluding `node_modules`, `dist`, `dist-game`, `.git`, `.astro`, and `coverage`.

```text
.
├── .agents
├── .codex
├── .github
│   └── workflows
├── .vscode
├── apps
│   ├── game
│   │   └── src
│   └── website
├── dev-dist
├── docker
│   └── supabase
├── docs
├── packages
│   └── shared
├── public
├── scripts
├── server
│   └── colyseus
│       └── src
└── src
    ├── components
    │   ├── cta
    │   ├── game
    │   ├── layout
    │   ├── media
    │   ├── navigation
    │   ├── news
    │   └── pages
    ├── data
    ├── dev-pages
    ├── game
    │   ├── state
    │   └── ui
    ├── lib
    │   ├── i18n-data
    │   └── pages
    ├── pages
    │   ├── [locale]
    │   ├── it
    │   └── news
    └── styles
```

## Main Folder Table

| Folder | Current purpose | Used by website | Used by game | Empty/transitional | Removal risk |
| --- | --- | --- | --- | --- | --- |
| `src/` | Historical Astro application root. Contains website pages, components, libs, dev pages, and current game runtime. | Yes | Yes, because `src/game` is the current runtime. | No | Critical. Removing breaks everything. |
| `src/pages/` | Astro routes for public pages, localized pages, news, legal pages, and dev catch-all. | Yes | Indirectly, only for Astro dev route `/__dev/play`. | No | Critical for website. |
| `src/components/` | Website components plus legacy game compatibility exports. | Yes | Partly, only `src/components/game` as compatibility layer. | No | Medium to high. Removing all breaks website; removing `components/game` should wait until consumers are gone. |
| `src/components/game/` | Legacy re-export layer pointing to `src/game`. | Possibly for backward compatibility | Indirectly legacy only | Transitional | Medium. Current scans show only re-exports, but remove only after confirming no external or stale imports. |
| `src/game/` | Current canonical game runtime: React root, R3F canvas, UI, Zustand, XState, game CSS, game copy. | Yes, via Astro dev pages | Yes, via `apps/game/src/main.tsx` | Transitional location, but active code | Critical. Removing breaks both `/__dev/play` and standalone game. |
| `src/lib/` | Website utilities: i18n, SEO, news, markdown, base paths, PocketBase, Supabase. | Yes | Mostly no after game copy extraction. | No | Critical for website. |
| `src/lib/pages/` | Page/area copy modules for website pages. | Yes | No | No | High for website content. |
| `src/lib/i18n-data/` | Site i18n data. Still contains `site/game.ts` for website-level i18n compatibility. | Yes | Not directly after `src/game/copy.ts` extraction | Partly transitional for game copy | Medium. Do not remove until site copy consumers are audited. |
| `src/dev-pages/` | Internal dev/demo screens rendered by `src/pages/[...dev].astro`. | Yes in dev route | Yes for game dev/demo pages | Transitional/dev-only | Low to medium. Removing affects dev routes, not public production intent. |
| `src/styles/` | Website global CSS. | Yes | Astro dev game route loads it through the site shell; standalone game does not. | No | High for website styling. |
| `src/data/` | Website data files such as navigation JSON. | Yes | No | No | Medium. Removing breaks navigation/data consumers. |
| `public/` | Static website assets and currently shared game assets. | Yes | Yes, because `apps/game/vite.config.mjs` uses root `public` as `publicDir`. | No | Critical. Removing breaks site assets, PWA icons, and current standalone game assets. |
| `apps/` | Future multi-app workspace container. | No direct website use | Yes through `apps/game` scripts | Transitional root | Low if empty, but keep for migration clarity. |
| `apps/game/` | Standalone Vite host for the game. Contains entry HTML, main React bootstrap, standalone CSS, Vite config. | No | Yes | Active transitional app | High. Removing breaks `npm run game:*`. |
| `apps/website/` | Placeholder for future website app. Contains only README. | No | No | Yes | Low. Safe to remove if you do not want the placeholder yet. |
| `packages/` | Future shared packages container. | No current code use | No current code use | Transitional root | Low. Keep only if migration docs matter now. |
| `packages/shared/` | Placeholder for future shared code. Contains only README. | No | No | Yes | Low. Safe to remove if no shared package will be created soon. |
| `docs/` | Project documentation and migration reports. | No runtime use | No runtime use | No | Low runtime risk; high planning value. |
| `.github/` | GitHub Actions workflows. | Deploy/build related | Possibly via scripts indirectly | No | High for CI/deploy. |
| `.vscode/` | Editor settings. | No runtime use | No runtime use | Project tooling | Low. |
| `.agents/` | Empty local/agent folder. | No | No | Empty | Very low, if not used by local tooling. |
| `.codex/` | Empty local/Codex folder. | No | No | Empty | Very low, if not used by local tooling. |
| `scripts/` | Currently empty. | No | No | Empty | Very low. |
| `server/` | Colyseus server prototype/backend runtime. | No current website import found | No current game import found | Separate backend prototype | Medium. Do not remove unless multiplayer/server direction is intentionally paused. |
| `docker/` | Docker/Supabase support config. | No direct app import | No direct game import | Infrastructure/prototype | Medium. Remove only if Supabase/Docker workflow is abandoned. |
| `dev-dist/` | Development build/output-looking folder. | Not referenced in current scans | Not referenced in current scans | Likely generated/transitional | Low to medium. Verify contents before deleting. |

## `apps/website` Usage Check

`apps/website` is not currently used by any active script, import, or config.

Evidence:

- `package.json` has only root Astro scripts and `apps/game` scripts.
- No active import references `apps/website`.
- No config references `apps/website`.
- The only meaningful reference found is documentation text in `packages/shared/README.md`.
- The folder contains only `apps/website/README.md`.

Conclusion: `apps/website` is a placeholder for the future extraction of the Astro site. It can be removed now with low runtime risk, but keeping it is useful if the repo is intentionally documenting the future monorepo shape.

## `apps/game` Dependency Check

`apps/game` still depends on root `src` and root `public`.

Current dependency on root `src`:

```ts
// apps/game/src/main.tsx
import GameApp from '../../../src/game/GameApp';
```

Current dependency on root `public`:

```js
// apps/game/vite.config.mjs
publicDir: `${repoRoot}/public`
```

Runtime asset references that rely on that shared public directory:

- `src/game/game.css` references `/game-menu-background.png`.
- `src/game/ui/GameHUD.tsx` references `/logo-bboyarena.svg`.
- `src/game/ui/GameUIDemoScene.tsx` references `/logo-bboyarena.svg`.

Conclusion: `apps/game` is a standalone host, but not a self-contained app yet. It can build independently, but it still consumes game runtime source from `src/game` and static assets from root `public`.

## Root `src` Ownership Check

Root `src` currently contains three categories.

### Code only for the website

- `src/pages/**`
- `src/components/layout/**`
- `src/components/navigation/**`
- `src/components/pages/**`
- `src/components/cta/**`
- `src/components/news/**`
- `src/components/media/**`
- `src/styles/global.css`
- `src/data/**`
- Most of `src/lib/**`

### Code only for the game

- `src/game/**`
- `src/game/state/**`
- `src/game/ui/**`
- `src/game/game.css`
- `src/game/copy.ts`

### Transitional or shared-looking code

- `src/components/game/**`: compatibility re-exports to `src/game`.
- `src/dev-pages/play.astro`: Astro dev wrapper for the game.
- `src/dev-pages/game-ui.astro`: Astro dev wrapper for game UI demo.
- `src/pages/[...dev].astro`: Astro route that mounts internal dev pages and imports both global CSS and game CSS.
- `src/lib/i18n-data/site/game.ts`: still part of site i18n data, even though the runtime game now has `src/game/copy.ts`.
- `public/**`: shared asset bucket for both website and current standalone game host.

## Folders Removable Immediately

These are technically removable with low runtime risk, based on current scans. I would still remove them in a separate cleanup commit, not mixed with feature work.

| Folder | Why removable | Caveat |
| --- | --- | --- |
| `apps/website/` | Placeholder only; no scripts/imports/config use it. | Keep if you want the future structure visible in the repo. |
| `packages/shared/` | Placeholder only; no code imports it. | Keep if you want migration docs to match the planned monorepo shape. |
| `scripts/` | Empty. | Confirm no local workflow expects it. |
| `.agents/` | Empty. | Confirm no local tooling expects it. |
| `.codex/` | Empty. | Confirm no local tooling expects it. |
| `src/pages/it/` | Empty. | Astro i18n currently uses `src/pages/[locale]`, so this looks obsolete. |

`dev-dist/` may also be removable, but I would inspect its contents and origin first because it looks like generated output but was not part of the exclusion list.

## Folders To Keep Temporarily

| Folder | Reason to keep temporarily |
| --- | --- |
| `src/game/` | Canonical game runtime until it can move into `apps/game/src`. |
| `src/components/game/` | Compatibility layer. Remove only after all imports and external references are checked. |
| `public/` | Shared asset bucket required by website, PWA, and current `apps/game` build. |
| `src/dev-pages/` | Useful for internal visual/game testing through Astro. |
| `apps/game/` | Active standalone game host. |
| `apps/` | Useful as the migration container while `apps/game` is active. |
| `docs/` | Holds migration reports and decisions. |
| `server/` | Backend/multiplayer prototype. Not tied to current frontend, but likely strategic. |
| `docker/` | Infrastructure/prototype support. Keep unless Supabase/Docker path is abandoned. |

## Short-Term Recommended Structure

Without moving files yet, the clean short-term mental model should be:

```text
.
├── apps
│   └── game                 # standalone Vite host only
├── docs                     # migration and architecture docs
├── public                   # shared static bucket for now
├── src
│   ├── components           # website components plus temporary game re-exports
│   ├── dev-pages            # Astro internal test pages
│   ├── game                 # canonical game runtime for now
│   ├── lib                  # website app utilities and copy
│   ├── pages                # Astro website routes
│   └── styles               # website global CSS
└── server                   # future/prototype backend
```

Recommended near-term cleanup:

1. Decide whether `apps/website` and `packages/shared` should stay as visible placeholders.
2. If not, remove them in a dedicated cleanup commit.
3. Keep `src/game` as the canonical runtime until asset ownership is solved.
4. Keep `src/components/game` until no route, doc, or external consumer depends on the old path.
5. Move game assets into a game-owned public folder only in a later extraction step.

## Long-Term Recommended Structure

The long-term structure should make ownership obvious:

```text
.
├── apps
│   ├── website
│   │   ├── public
│   │   └── src
│   │       ├── components
│   │       ├── lib
│   │       ├── pages
│   │       └── styles
│   └── game
│       ├── public
│       └── src
│           ├── assets
│           ├── bootstrap
│           ├── canvas
│           ├── copy
│           ├── state
│           └── ui
├── packages
│   └── shared
│       └── src
└── server
    └── colyseus
```

In that final shape:

- `apps/website` owns Astro routes, SEO, legal pages, news pages, PWA config, and website assets.
- `apps/game` owns Vite config, game runtime, game public assets, game CSS, Zustand, XState, R3F canvas, and game UI.
- `packages/shared` exists only if both apps truly need the same code, such as narrow types or API contracts.
- Root `public` disappears or becomes app-specific.
- Root `src` disappears or becomes temporary only during migration.

## Recommended Extraction Order

1. Keep current runtime stable.
2. Move or duplicate game-owned assets into a future `apps/game/public`.
3. Update `apps/game/vite.config.mjs` to stop using root `public`.
4. Remove or update any remaining `src/components/game` consumers.
5. Move `src/game` into `apps/game/src/game` or flatten it into `apps/game/src`.
6. Only after that, decide whether the Astro website should move from root `src` into `apps/website/src`.
7. Introduce `packages/shared` only when there is a real shared contract, not as a dumping ground.

## Practical Decision

For now, the safest thing to delete, if you want less visual noise, is:

- `apps/website/`
- `packages/shared/`
- `scripts/`
- `src/pages/it/`

The safest thing to keep, even if transitional, is:

- `apps/game/`
- `src/game/`
- `src/components/game/`
- `public/`
- `src/dev-pages/`

This keeps the current site and game working while making the next extraction steps clearer.
