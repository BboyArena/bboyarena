# Current Architecture

Date: 2026-06-24

This document describes the current repository architecture after separating the website and game into independent apps.

## Repository Structure

```text
.
├── apps
│   ├── game
│   │   ├── public
│   │   ├── src
│   │   │   ├── game
│   │   │   ├── main.tsx
│   │   │   └── standalone.css
│   │   ├── index.html
│   │   ├── README.md
│   │   └── vite.config.mjs
│   └── website
│       ├── public
│       ├── src
│       │   ├── components
│       │   ├── dev-pages
│       │   ├── lib
│       │   ├── pages
│       │   └── styles
│       └── astro.config.mjs
├── docs
├── package.json
└── tsconfig.json
```

## Website Ownership

The website is owned by:

```text
apps/website
```

The Astro app lives in:

- `apps/website/src/pages`
- `apps/website/src/components`
- `apps/website/src/lib`
- `apps/website/src/styles`
- `apps/website/public`
- `apps/website/astro.config.mjs`

Root `package.json` delegates website commands to this app with:

```bash
astro <command> --root apps/website
```

The website build still writes to root `dist` through:

```js
outDir: '../../dist'
```

This keeps GitHub Pages deployment simple because the deploy artifact remains:

```text
./dist
```

## Game Ownership

The standalone game is owned by:

```text
apps/game
```

The game runtime lives in:

```text
apps/game/src/game
```

This folder owns:

- `GameApp`
- `GamePlayScene`
- `CanvasScene`
- `Player`
- game copy boundary
- game CSS
- Zustand game store
- XState game machine
- HUD and menu UI components
- fullscreen controls
- game UI demo scene

The standalone game entrypoint is:

```text
apps/game/src/main.tsx
```

It imports the game directly from:

```ts
import GameApp from './game/GameApp';
```

## Integration Boundary

The website no longer imports the game runtime.

The website integrates the game through a browser boundary:

```text
iframe / URL
```

The player-facing showroom route is:

```text
/play-the-game
```

That page lives in:

```text
apps/website/src/components/pages/PlayTheGamePage.astro
```

It reads the game iframe URL from:

```text
PUBLIC_GAME_EMBED_URL
```

In development, if `PUBLIC_GAME_EMBED_URL` is not set, the page falls back to:

```text
http://localhost:4322/
```

This lets the two apps run side by side:

```bash
npm run game:dev
npm run dev
```

## Removed Bridges

The temporary website bridges have been removed:

- `apps/website/src/game`
- `apps/website/src/components/game`
- `apps/website/src/dev-pages/play.astro`
- `apps/website/src/dev-pages/game-ui.astro`

The website dev router no longer exposes:

- `/__dev/play`
- `/__dev/game-ui`

The old internal game demo routes are replaced by:

- standalone game app: `http://localhost:4322/`
- website iframe showroom: `http://localhost:4321/play-the-game`

## Asset Ownership

### Website Assets

Website static assets live in:

```text
apps/website/public
```

This includes:

- PWA icons
- SEO/social images
- `CNAME`
- `robots.txt`
- website panorama/banner imagery

### Game Assets

Game-owned static assets live in:

```text
apps/game/public
```

Current game-owned assets:

- `game-menu-background.png`
- `logo-bboyarena.svg`

The standalone Vite config uses:

```js
publicDir: `${gameRoot}/public`
```

### Duplicated Assets

Some assets currently exist in both apps by design:

- `logo-bboyarena.svg`
- `game-menu-background.png`

This is acceptable because each app owns its own deployed static directory. A later cleanup can remove duplicated website assets only after every website reference is audited.

## Commands

### Run Website Dev Server

```bash
npm run dev
```

Runs Astro from `apps/website`.

Default local URL:

```text
http://localhost:4321/
```

### Build Website

```bash
npm run build
```

Builds the Astro website from `apps/website` into root `dist`.

### Preview Website Build

```bash
npm run preview
```

Previews the website build from `dist`.

### Run Standalone Game Dev Server

```bash
npm run game:dev
```

Starts the standalone Vite game app from `apps/game`.

Default local URL:

```text
http://localhost:4322/
```

### Build Standalone Game

```bash
npm run game:build
```

Builds the standalone game into `dist-game`.

### Preview Standalone Game Build

```bash
npm run game:preview
```

Previews the production game build.

## What Not To Do Now

Do not add new website code to a root `src` folder. Website source belongs in `apps/website/src`.

Do not add new website assets to a root `public` folder. Website assets belong in `apps/website/public`.

Do not import `apps/game/src/game` from the website.

Do not recreate `apps/website/src/game` or `apps/website/src/components/game`.

Do not put game copy inside the website i18n system. Game copy belongs in `apps/game/src/game/copy.ts`.

Do not refactor game internals while doing website/game ownership work. Keep gameplay, state, and UI behavior stable.

## Current Recommended Mental Model

Use this ownership model when adding new files:

```text
Website app         -> apps/website
Website code        -> apps/website/src
Website assets      -> apps/website/public
Standalone game     -> apps/game
Game runtime        -> apps/game/src/game
Game assets         -> apps/game/public
Website/game link   -> iframe URL, usually PUBLIC_GAME_EMBED_URL
Architecture notes  -> docs
```

If a file is new game runtime code, it should go into `apps/game/src/game`.

If a file is new website code, it should go into `apps/website/src`.
