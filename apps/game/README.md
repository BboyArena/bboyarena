# Game App

This folder owns the standalone game application.

Current status:

- The active game runtime lives under `apps/game/src/game`.
- The standalone Vite host mounts `apps/game/src/game/GameApp` without Astro `Layout.astro`.
- The website does not import the game runtime; it embeds the standalone game through an iframe/URL boundary.
- Game static assets live under `apps/game/public`.
- Tailwind v4 is enabled for the standalone game entry via `@tailwindcss/vite`.
- Game theme tokens are exposed in `apps/game/src/standalone.css` for future utility-class work.

Runtime responsibilities:

- Game runtime entry point
- R3F / Three.js canvas scene
- Game-only UI, HUD, fullscreen controls, and menu screens
- Zustand store and XState machine
- Game-specific CSS and asset loading strategy
- Tailwind utilities for new game UI work, while keeping the existing handcrafted CSS intact

The app should stay runnable without Astro `Layout.astro`, website global CSS, or website Tailwind utilities.

Detailed implementation belongs in the [game scene and screen architecture](./docs/threejs-scene-architecture.md). The active motion, animation, and replay work is tracked in the [implementation plan](./docs/plan.md). Repository-wide boundaries are defined by the [current architecture](../../docs/current-architecture.md).

Set `PUBLIC_ANIMATION_CATALOG_URL` to load a remote animation catalog. Invalid or unavailable remote data falls back to the bundled local catalog.

## Commands

From the repository root:

```bash
npm run game:dev
npm run game:build
npm run game:preview
```
