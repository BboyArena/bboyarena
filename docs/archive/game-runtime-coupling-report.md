# Game Runtime Coupling Report

> Archived audit. This report describes the repository before the completed website/game separation. Use the [current architecture](../current-architecture.md) for active rules.

## Scope

This report maps the import graph used by the standalone game host at `apps/game/src/main.tsx` and the current runtime under `src/game`.

No gameplay, assets, state, XState machines, CSS behavior, or source ownership were changed for this report.

## Current Standalone Entry

The standalone app starts at:

- `apps/game/index.html`
- `apps/game/src/main.tsx`
- `apps/game/vite.config.mjs`

Runtime entry:

- `apps/game/src/main.tsx` imports `../../../src/game/GameApp`.
- `src/game/GameApp.tsx` imports `src/game/game.css`.
- `apps/game/src/standalone.css` only styles the standalone mount host.

The game can already build without Astro `Layout.astro`, but it still imports some website-owned modules and assets.

## Import Summary

### Direct app imports

| File | Imports | Notes |
| --- | --- | --- |
| `apps/game/src/main.tsx` | `react`, `react-dom/client`, `../../../src/game/GameApp`, `./standalone.css` | Standalone bootstrap is independent from Astro, but still points into root `src/game`. |
| `apps/game/vite.config.mjs` | `vite`, `@vitejs/plugin-react`, `node:url` | Uses root `public` folder as `publicDir`. |

### Game runtime imports

| File | Imports | Site coupling |
| --- | --- | --- |
| `src/game/GameApp.tsx` | React, game store, game UI, `GamePlayScene`, `../lib/i18n`, `./game.css` | Imports website i18n type. |
| `src/game/GamePlayScene.tsx` | React type, XState React, game machine, game store, canvas, game UI, `../lib/i18n` | Imports website i18n type. |
| `src/game/CanvasScene.tsx` | R3F, Drei, `./Player` | No website component dependency remains. |
| `src/game/Player.tsx` | React, R3F, game store, Three | Game-owned after previous step. |
| `src/game/ui/GameHUD.tsx` | game store, `../../lib/i18n`, game buttons/panels | Imports website copy lookup. |
| `src/game/ui/GamePlayHUD.tsx` | React, `../../lib/i18n`, game store, game buttons/panels | Imports website copy lookup. |
| `src/game/ui/GameUIDemoScene.tsx` | React, game UI components, `../game.css` | Uses root public logo asset. |
| `src/game/state/gameMachine.ts` | XState | No website coupling. |
| `src/game/state/useGameStore.ts` | Zustand | No website coupling. |

## Residual Coupling Toward The Website

### 1. Website i18n dependency

Files:

- `src/game/GameApp.tsx`
- `src/game/GamePlayScene.tsx`
- `src/game/ui/GameHUD.tsx`
- `src/game/ui/GamePlayHUD.tsx`

Coupling reason:

- `GameApp` and `GamePlayScene` import `LocaleCode` from `src/lib/i18n`.
- `GameHUD` and `GamePlayHUD` import `getSiteCopy` and `LocaleCode` from `src/lib/i18n`.
- `src/lib/i18n` is website-oriented and owns broader site copy, localized routes, nav copy, footer copy, news copy, legal/page copy, and locale helpers.
- The game only needs `copy.game` and a small locale type.

Extraction risk:

- Medium.
- The rendered text can be kept identical, but changing the copy source risks missing localized labels or accidentally changing fallback locale behavior.
- It also affects both menu UI and play HUD, so visual smoke testing is needed after refactor.

Recommended removal strategy:

1. Create `src/game/i18n` or `src/game/copy` with a game-owned `LocaleCode` type or import a narrow type from `packages/shared`.
2. Move only `GAME_COPY` out of `src/lib/i18n-data/site/game.ts` into the game boundary.
3. Replace `getSiteCopy(locale).game` with `getGameCopy(locale)`.
4. Keep all visible strings unchanged.
5. Build both `npm run build` and `npm run game:build`.

### 2. Shared root `public` asset dependency

Files:

- `src/game/game.css`
- `src/game/ui/GameHUD.tsx`
- `src/game/ui/GameUIDemoScene.tsx`
- `apps/game/vite.config.mjs`

Coupling reason:

- `src/game/game.css` references `/game-menu-background.png`.
- `GameHUD` and `GameUIDemoScene` reference `/logo-bboyarena.svg`.
- `apps/game/vite.config.mjs` sets `publicDir` to the root `public` folder so the standalone game can resolve those root-relative URLs.
- These assets are currently owned by the website public folder.

Extraction risk:

- Medium.
- The game works today because Vite exposes root `public`.
- A separate deploy, package, or CDN path may break if the standalone game no longer serves the same root assets.
- The CSS uses root-relative URLs, so `base` handling is not yet game-owned.

Recommended removal strategy:

1. Inventory game-owned assets: currently `game-menu-background.png` and `logo-bboyarena.svg`.
2. Add `apps/game/public` in a later step.
3. Copy or formally move game-owned assets only after deciding ownership.
4. Introduce a game asset path helper or Vite base strategy.
5. Update asset references without changing the files themselves.

### 3. Runtime source still lives outside `apps/game`

Files:

- `apps/game/src/main.tsx`
- all `src/game/**`

Coupling reason:

- The standalone host imports `GameApp` from `../../../src/game/GameApp`.
- This is acceptable for this transition phase, but `apps/game` is not yet a fully self-owned app.

Extraction risk:

- Low to medium.
- Builds work, but app ownership is split across `apps/game` and root `src/game`.
- Future package splitting will need import path changes.

Recommended removal strategy:

1. Keep `src/game` as canonical runtime until i18n and asset coupling are removed.
2. Move `src/game` into `apps/game/src/game` only after the game no longer imports `src/lib`.
3. Add compatibility exports only if the website still embeds the game from old paths.

### 4. Compatibility exports under `src/components/game`

Files:

- `src/components/game/GameApp.tsx`
- `src/components/game/GameCanvas.tsx`
- `src/components/game/Hud.tsx`
- `src/components/game/Player.tsx`
- `src/components/game/state/gameMachine.ts`
- `src/components/game/state/useGameStore.ts`

Coupling reason:

- These files expose the game through the website component namespace.
- `Player` is now game-owned, but the old path is still available as a re-export.

Extraction risk:

- Low.
- They do not block current standalone build, but they keep an old mental model alive.
- Removing them too early could break old imports or dev experiments.

Recommended removal strategy:

1. Search for all consumers of `src/components/game`.
2. Update consumers to import from `src/game`.
3. Remove the re-export layer only after no imports remain.

## Things Not Currently Coupled

### Astro Layout

The standalone path does not import:

- `src/components/layout/Layout.astro`
- Astro pages
- Astro route files

Astro layout coupling still exists for website dev pages like `/__dev/play`, but not for `apps/game`.

### Website global CSS

The standalone entry does not import:

- `src/styles/global.css`
- Tailwind global CSS
- website `street-*` classes

The runtime imports only:

- `src/game/game.css`
- `apps/game/src/standalone.css`

### Website UI components

The runtime does not import website components such as:

- `src/components/cta`
- `src/components/layout`
- `src/components/navigation`
- `src/components/pages`
- `src/components/news`
- `src/components/media`

The only remaining `src/components/game` files are compatibility exports.

## Asset Coupling Detail

| File | Asset path | Reason | Risk |
| --- | --- | --- | --- |
| `src/game/game.css` | `/game-menu-background.png` | Menu and splash background | Breaks if standalone public root changes. |
| `src/game/ui/GameHUD.tsx` | `/logo-bboyarena.svg` | Splash/menu logo | Breaks if standalone public root changes. |
| `src/game/ui/GameUIDemoScene.tsx` | `/logo-bboyarena.svg` | UI demo logo | Breaks if standalone public root changes. |
| `apps/game/vite.config.mjs` | `publicDir: ../../public` | Makes current root assets available to standalone build | Keeps app dependent on website public folder. |

## Recommended Next Refactor Order

1. Extract game copy boundary.
   - Create `src/game/copy.ts` or `src/game/i18n.ts`.
   - Move or duplicate the current `GAME_COPY` structure into game-owned code.
   - Keep output text unchanged.

2. Replace `src/lib/i18n` imports in game runtime.
   - Update `GameApp`, `GamePlayScene`, `GameHUD`, and `GamePlayHUD`.
   - Verify `npm run build` and `npm run game:build`.

3. Introduce game asset ownership.
   - Add `apps/game/public`.
   - Copy current game assets into it without changing the originals.
   - Point `apps/game/vite.config.mjs` to game public only.
   - Keep Astro build working with root public assets until the website embed strategy is decided.

4. Remove compatibility exports when safe.
   - Search for `src/components/game` imports.
   - Remove re-export files after all consumers are migrated.

5. Move runtime ownership.
   - Move `src/game` into `apps/game/src/game` only after i18n and asset ownership are clean.
   - Add temporary exports or aliases if the website still embeds the game.

## Proposed Final `src/game` Structure

Short-term final structure while still inside root `src`:

```text
src/game/
  GameApp.tsx
  GamePlayScene.tsx
  CanvasScene.tsx
  Player.tsx
  game.css
  assets.ts
  copy.ts
  state/
    gameMachine.ts
    useGameStore.ts
  ui/
    GameButton.tsx
    GameFullscreenReticle.tsx
    GameFullscreenToggle.tsx
    GameHUD.tsx
    GameMenu.tsx
    GamePanel.tsx
    GamePlayHUD.tsx
    GameUIDemoScene.tsx
```

Long-term final structure after app extraction:

```text
apps/game/
  index.html
  vite.config.mjs
  public/
    game-menu-background.png
    logo-bboyarena.svg
  src/
    main.tsx
    standalone.css
    game/
      GameApp.tsx
      GamePlayScene.tsx
      CanvasScene.tsx
      Player.tsx
      game.css
      assets.ts
      copy.ts
      state/
        gameMachine.ts
        useGameStore.ts
      ui/
        GameButton.tsx
        GameFullscreenReticle.tsx
        GameFullscreenToggle.tsx
        GameHUD.tsx
        GameMenu.tsx
        GamePanel.tsx
        GamePlayHUD.tsx
        GameUIDemoScene.tsx
```

## Verification Required After Future Refactors

- `npm run build`
- `npm run game:build`
- Open `/__dev/play` while the Astro adapter still exists.
- Run `npm run game:dev` and verify the standalone menu and play canvas load.
- Confirm logo and menu background still render in standalone and Astro-hosted modes.
