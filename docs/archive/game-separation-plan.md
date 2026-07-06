# Game Separation Plan

> Archived completed plan. Paths and ownership statements below describe the migration state at the time of the audit. Use the [current architecture](../current-architecture.md) for active rules.

## Scope

This document is a discovery and migration plan for separating the game runtime from the Astro website. It does not move existing source files and does not change gameplay, assets, Three.js logic, Zustand state, XState machines, or UX.

Target structure prepared in this branch:

```text
apps/
  website/
  game/

packages/
  shared/
```

## Current Dependency Picture

Runtime dependencies in the root `package.json` are shared by the whole project today:

- `astro`: owns website routing, layouts, static output, and dev pages.
- `@astrojs/react`: mounts React islands, including the current game entry inside Astro pages.
- `@tailwindcss/vite` and `tailwindcss`: website global styling and dev page utility styling.
- `@vite-pwa/astro` and `vite-plugin-pwa`: website PWA configuration.
- `@astrojs/sitemap`: website sitemap generation.
- `react` and `react-dom`: shared by website islands and game runtime.
- `three`, `@react-three/fiber`, `@react-three/drei`: game 3D runtime and panorama-related 3D dependencies.
- `zustand`: game state store.
- `xstate` and `@xstate/react`: game state machine runtime.
- `@photo-sphere-viewer/core`: website panorama viewer, not the game runtime.
- `@supabase/supabase-js`: website/server integration surface.
- `marked`: website news Markdown rendering.

There is no standalone Vite config today. Tailwind and React are configured through `astro.config.mjs`.

## Current Ownership Map

### Exclusively Website

- `src/pages/**`: public Astro routes, localized pages, news, legal pages, and dev route dispatcher.
- `src/components/layout/**`: global website layout, SEO shell, header, footer, PWA tags, and analytics.
- `src/components/navigation/**`: website navigation and logo placement.
- `src/components/pages/**`: website page compositions.
- `src/components/cta/**`: website cards and CTAs.
- `src/components/news/**`: website news rendering helpers.
- `src/components/media/PanoramaFallback.astro`: website Astro wrapper for panorama fallback.
- `src/components/media/PanoramaViewer.tsx`: website React island for Photo Sphere Viewer.
- `src/lib/news.ts`, `src/lib/pocketbase.ts`, `src/lib/markdown.ts`, `src/lib/seo.ts`, `src/lib/supabase.ts`: website data and integration helpers.
- `src/lib/pages/**`: website page copy.
- `src/styles/global.css`: website Tailwind import and global street theme classes.
- `src/data/navigation.json`: website navigation data.
- `astro.config.mjs`: currently website build, PWA, sitemap, i18n, React, and Tailwind config.

### Exclusively Game

- `src/game/GameApp.tsx`: current game runtime root.
- `src/game/GamePlayScene.tsx`: play scene shell that wires XState, Zustand, canvas, HUD, and fullscreen.
- `src/game/CanvasScene.tsx`: current R3F scene wrapper and environment composition.
- `src/game/state/gameMachine.ts`: XState game machine.
- `src/game/state/useGameStore.ts`: Zustand store.
- `src/game/ui/**`: game HUD, menu, panels, buttons, fullscreen controls, and UI demo scene.
- `src/game/game.css`: isolated game runtime CSS.

### Shared Or Ambiguous

- `src/components/game/Player.tsx`: game-only code stored under website component namespace.
- `src/components/game/GameApp.tsx`, `src/components/game/GameCanvas.tsx`, `src/components/game/Hud.tsx`: compatibility re-exports pointing back to `src/game`.
- `src/components/game/state/**`: compatibility re-exports for game state.
- `src/dev-pages/play.astro`: Astro dev wrapper around the game runtime.
- `src/dev-pages/game-ui.astro`: Astro dev wrapper around game UI demo.
- `src/pages/[...dev].astro`: Astro-only dev dispatcher importing both website global CSS and game CSS.
- `src/lib/i18n.ts`, `src/lib/i18n-types.ts`, `src/lib/i18n-data/site/game.ts`: currently used by both website and game UI.
- `public/logo-bboyarena.svg` and `public/game-menu-background.png`: game UI assets stored in the website public directory.

## Coupling Found

| Source file | Coupling | Why it blocks separation | Removal strategy |
| --- | --- | --- | --- |
| `src/pages/[...dev].astro` | Imports `src/styles/global.css` and `src/game/game.css` together | The game is mounted through an Astro route that also loads website globals | Create a game-only dev entry in `apps/game`; keep Astro dev route as an adapter until replacement is ready |
| `src/dev-pages/play.astro` | Imports `Layout.astro` and `GameApp` | The game preview depends on website layout, header, footer, and main page shell | Introduce a minimal game host page owned by the game app; leave this route as website integration smoke test |
| `src/dev-pages/game-ui.astro` | Imports `Layout.astro` and `GameUIDemoScene` | Game UI demo depends on website shell | Move the demo host responsibility to the future game app, then keep Astro route as optional bridge |
| `src/game/GameApp.tsx` | Imports `LocaleCode` from `src/lib/i18n` | Game root depends on website i18n types | Move shared locale type to `packages/shared` or replace with a game-local locale contract |
| `src/game/ui/GameHUD.tsx` | Imports `getSiteCopy` and `LocaleCode` from `src/lib/i18n` | Game UI reads copy from website i18n system | Extract game copy to a game-owned dictionary, or move only the minimal game copy contract to `packages/shared` |
| `src/game/ui/GamePlayHUD.tsx` | Imports `getSiteCopy` and `LocaleCode` from `src/lib/i18n` | Runtime HUD depends on website copy lookup | Same as above; create `gameCopy` boundary before moving runtime |
| `src/game/CanvasScene.tsx` | Imports `Player` from `src/components/game/Player` | Core game scene reaches back into website component tree | Move `Player` into `src/game` first, then later into `apps/game` |
| `src/components/game/**` | Re-exports from `src/game` | Old import path keeps game visible as website components | Remove consumers, then delete compatibility layer in a later cleanup |
| `src/components/game/Player.tsx` | Imports `useGameStore` from `src/game/state/useGameStore` | Game state is used from a component in the website namespace | Move file into game runtime ownership without changing logic |
| `src/game/game.css` | Uses root-relative public assets such as `/game-menu-background.png` and `/logo-bboyarena.svg` via React markup | Standalone deploy may not share the same public root or base path | Introduce a game asset path helper or game-owned static asset copy during extraction |
| `astro.config.mjs` | Owns React, Tailwind, PWA, sitemap, i18n, and static build | Game has no independent build config | Add `apps/game` Vite config later, reusing only React and game dependencies |
| Root `package.json` | Single dependency and script surface for site and game | Cannot install, build, or deploy game independently | Later split workspaces or app-level package manifests after source boundaries are stable |
| `public/**` | Website and game assets share one public bucket | Standalone game cannot declare asset ownership | Inventory game assets, then copy or remap them into `apps/game/public` in a later phase |

## Tailwind, CSS, Astro Layout, And React Site Coupling

### Game Uses Tailwind Global

- `src/dev-pages/play.astro`: uses Tailwind utility classes in the host markup around `GameApp`.
- `src/dev-pages/game-ui.astro`: uses Tailwind utility classes in the host markup around `GameUIDemoScene`.
- `src/pages/[...dev].astro`: imports `src/styles/global.css`, which imports Tailwind.

The React game runtime under `src/game` does not use Tailwind utility class names directly. It uses game-scoped classes from `src/game/game.css`.

Removal strategy:

- Keep `src/game/game.css` as the runtime styling source.
- Move host layout styles out of Astro dev pages into a game-owned host shell later.
- Do not require Tailwind for `apps/game` unless a future deliberate UI decision introduces it.

### Game Uses CSS From The Site

- `src/pages/[...dev].astro` loads `src/styles/global.css` before dev pages render.
- `src/dev-pages/play.astro` and `src/dev-pages/game-ui.astro` rely on Tailwind utilities from global CSS.
- `Layout.astro` wraps the game dev pages with website header, footer, global background, and global CSS.

Removal strategy:

- Create a standalone game host that imports only `src/game/game.css`.
- Keep `#bboyarena-game-root { all: initial; }` as the containment layer.
- Later verify whether any visual differences appear once the Astro website shell is removed.

### Game Uses Astro Layout

- `src/dev-pages/play.astro` wraps `GameApp` in `Layout.astro`.
- `src/dev-pages/game-ui.astro` wraps `GameUIDemoScene` in `Layout.astro`.
- `src/pages/[...dev].astro` is the Astro route dispatcher for game dev pages.

Removal strategy:

- Keep these pages as temporary website integration adapters.
- Add a game-only app entry in a later phase.
- Once the game app can run independently, point dev work at `apps/game` and keep Astro only for embedding tests.

### Game Uses React Components From The Site

- `src/game/CanvasScene.tsx` imports `Player` from `src/components/game/Player`.
- `src/components/game/**` exposes compatibility re-exports to game internals.

Removal strategy:

- First move `Player` into the game-owned tree without changing its code.
- Then remove or deprecate the compatibility re-export files after all imports point to the game tree.

## Files That Currently Prevent Clean Separation

- `src/pages/[...dev].astro`: central Astro dev router and CSS bridge.
- `src/dev-pages/play.astro`: game host is still a website page.
- `src/dev-pages/game-ui.astro`: game UI demo host is still a website page.
- `src/game/CanvasScene.tsx`: imports from `src/components/game`.
- `src/components/game/Player.tsx`: game component in website namespace.
- `src/game/ui/GameHUD.tsx`: depends on website i18n.
- `src/game/ui/GamePlayHUD.tsx`: depends on website i18n.
- `src/game/GameApp.tsx`: depends on website locale type.
- `astro.config.mjs`: single build pipeline for website and game.
- `package.json`: single dependency and script boundary.
- `public/logo-bboyarena.svg` and `public/game-menu-background.png`: game-visible assets in shared public root.

## Recommended Extraction Order

1. Stabilize the game runtime boundary in place.
   - Move `src/components/game/Player.tsx` into `src/game` without changing behavior.
   - Update only imports that reference the old path.
   - Keep compatibility re-exports until no consumers remain.

2. Remove website i18n from runtime game files.
   - Extract a minimal game copy module or shared locale type.
   - Replace `getSiteCopy` usage in `GameHUD` and `GamePlayHUD` with a game-owned copy lookup.
   - Keep displayed text the same.

3. Introduce a game host entry.
   - Add an app-local entry for `apps/game`.
   - Import only React, the game root, and `game.css`.
   - Keep Astro dev routes as adapters during transition.

4. Separate game assets.
   - Inventory `logo-bboyarena.svg` and `game-menu-background.png`.
   - Decide whether assets move into `apps/game/public` or into `packages/shared/assets`.
   - Replace root-relative URLs with a game asset path contract.

5. Split build configuration.
   - Add a Vite config for `apps/game`.
   - Leave Astro config as website-only.
   - Keep root scripts delegating to app scripts until workspaces are introduced.

6. Split package boundaries.
   - Introduce workspaces only after source ownership is clear.
   - Give `apps/website`, `apps/game`, and `packages/shared` their own dependency surfaces.
   - Remove game dependencies from website only after imports prove the split.

7. Remove temporary bridges.
   - Remove `src/components/game` compatibility re-exports.
   - Keep `src/dev-pages/play.astro` only if the website still needs an embedded game preview.
   - Document the embed API from game to website.

## Target Ownership After Migration

### `apps/website`

- Astro routing, layouts, SEO, PWA, sitemap, legal pages, news, devlogs, public content.
- Website-only React islands such as panorama viewer.
- Website global CSS and Tailwind configuration.

### `apps/game`

- React game root.
- Three.js / R3F runtime.
- Game HUD, fullscreen controls, game menus, state, and machine wiring.
- Game CSS and game host shell.
- Game-specific static assets or asset resolver.

### `packages/shared`

- Only code genuinely needed by both apps.
- Candidate examples: locale type, brand constants, narrow asset path helpers.
- Avoid moving website content helpers here unless the game directly needs them.

## Non-Goals For This Phase

- No gameplay changes.
- No asset changes.
- No Three.js or R3F logic changes.
- No Zustand state changes.
- No XState machine changes.
- No UX changes.
- No dependency additions.
- No source file moves.
- No broken imports.

## Verification Checklist For Future Phases

- `npm run build` still passes after each extraction step.
- `/__dev/play` still renders the game while Astro adapter exists.
- The standalone game host renders without `Layout.astro`.
- The standalone game host renders without `src/styles/global.css`.
- The game still works with only `game.css` loaded.
- Public website pages do not import game runtime code.
- Game runtime does not import website page, layout, SEO, news, legal, or Tailwind modules.
