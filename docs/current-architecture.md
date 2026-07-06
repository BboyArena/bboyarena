# Current Architecture

This document defines the runtime boundaries and dependency rules between BboyArena applications. It intentionally does not repeat the complete stack, route catalog, environment-variable catalog, or product conventions maintained in the [project specification](../PROJECT_SPEC.md).

## System boundary

```text
                         build-time content
                   ┌─────────────────────────┐
                   │ PocketBase / news feeds │
                   └────────────┬────────────┘
                                │
                                ▼
┌───────────────┐      URL      ┌──────────────────┐
│ Astro website │ ────────────► │ Standalone game  │
│ apps/website  │    iframe     │ apps/game        │
└───────┬───────┘               └──────────────────┘
        │
        │ optional browser clients
        ▼
┌──────────────────────────────────────────────┐
│ Supabase / analytics / experimental Colyseus │
└──────────────────────────────────────────────┘
```

The website and game are independent front-end applications. Their integration boundary is a URL rendered by the website's `/play-the-game` page. Neither application imports source code from the other.

## Ownership boundaries

| Boundary | Owner | May depend on | Must not depend on |
| --- | --- | --- | --- |
| Public website | `apps/website` | Astro integrations, website components and libraries, optional remote content clients | Game runtime modules or game CSS |
| Standalone game | `apps/game` | React, Three.js/R3F, game state, input, UI, game-owned assets | Astro layout, website components, website global CSS |
| Experimental multiplayer | `server/colyseus` | Colyseus server packages and its own runtime configuration | Front-end source modules |
| Governance | `legal` | Other legal documents through relative links | Runtime implementation |
| AI role prompts | `agents` | Canonical repository documentation | Authority over product or architecture truth |

## Website boundary

The Astro application owns:

- public and localized routes;
- layout, navigation, footer, and website styling;
- editorial, community, legal, privacy, SEO, and PWA behavior;
- website data adapters and optional browser clients;
- assets under `apps/website/public`.

It builds statically to root `dist/`. It can point to the game through `PUBLIC_GAME_EMBED_URL`, but it must treat that target as an external document.

## Game boundary

The Vite application owns:

- the React entry point and game screen selector;
- Three.js/React Three Fiber scenes;
- player, gameplay, input, UI, and lifecycle state;
- game localization and game-specific CSS;
- assets under `apps/game/public`.

It builds to root `dist-game/`. The game must remain runnable without Astro, website CSS, or a website development server.

## Server boundary

`server/colyseus` is an experimental service, not a required dependency of the current static website or game shell. A future multiplayer feature may consume it through a network protocol; it must not create shared source imports between server and front-end applications.

## Permitted communication

- Website → game: iframe or navigation URL.
- Front end → remote content/data service: HTTP client configured by environment variables.
- Future game → Colyseus: WebSocket protocol.
- Shared human-readable policy: repository documentation.

If typed runtime contracts eventually need to be shared, create a deliberately scoped package only after a concrete cross-application requirement exists. Do not use an ambiguous root `src/` directory as a shortcut.

## Asset ownership

Each application owns and deploys its own static directory. An asset may be duplicated between applications when both deployments require it. Remove duplication only after confirming that one app no longer references its copy.

Asset URLs must respect the owning application's configured base path.

## Architectural invariants

1. New website source belongs under `apps/website`.
2. New game source belongs under `apps/game`.
3. Website code does not import game runtime code.
4. Game code does not import website code or Astro-specific modules.
5. The standalone game must build and run independently.
6. Menu and HUD interfaces remain DOM-based unless 3D interaction provides a concrete benefit.
7. Device APIs terminate in the input layer; gameplay consumes canonical intent.
8. Multiplayer remains experimental until the product specification explicitly promotes it.
9. Root `dist/` and `dist-game/` are outputs, never source directories.

## Decision test for new code

Ask these questions in order:

1. Is this public content, website navigation, SEO, legal, or community functionality? Put it in `apps/website`.
2. Is this gameplay, rendering, game input, game state, or game UI? Put it in `apps/game`.
3. Is it server-authoritative networking behavior? Put it in `server/colyseus`.
4. Is it only documentation? Put it in the owning app's docs or repository `docs/`.
5. Is it genuinely required by more than one runtime? Define the contract first; introduce shared code only when duplication is riskier than the new coupling.

## Verification

Changes to an application boundary should pass the relevant independent build:

```bash
npm run build
npm run game:build
```

Also inspect imports when moving source across a boundary. A successful bundled build does not by itself prove that ownership remains clean.

## Related documents

- [Project specification](../PROJECT_SPEC.md) — canonical project-wide inventory and conventions.
- [Documentation index](./README.md) — document placement and authority.
- [Game scene architecture](../apps/game/docs/threejs-scene-architecture.md) — internal game composition.
- [Input Manager](./input-manager.md) — device-to-gameplay input boundary.
- [Historical separation plan](./archive/game-separation-plan.md) — completed migration context.
