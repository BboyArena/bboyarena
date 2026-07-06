# Three.js Scene and Screen Architecture

This document explains the current standalone game architecture, with particular attention to Three.js, React Three Fiber, the menu/gameplay boundary, input, fullscreen behavior, and screen selection.

## Runtime map

```text
apps/game/src/main.tsx
└── GameApp
    ├── menu and 2D screens
    ├── fullscreen controls
    └── GamePlayScene
        ├── GameInputProvider
        ├── CanvasScene
        │   ├── camera and lights
        │   ├── floor and environment
        │   └── Player
        ├── GamePlayHUD
        └── TouchControlsOverlay
```

The standalone entry point mounts `GameApp` without Astro, the website layout, or website CSS. The website can display the game through an iframe, but it does not import the runtime.

## Screen flow

`GameApp` owns the current top-level game screen. Menu screens remain DOM-based. A React Three Fiber canvas is mounted only for a screen that needs the 3D runtime, such as training or career gameplay.

Keeping WebGL unmounted in menu-only states saves memory and GPU work, especially on mobile devices. It also keeps 2D navigation separate from scene ownership.

## Scene composition

`CanvasScene.tsx` owns the React Three Fiber canvas and its resilient loading/error boundary. `GamePlayScene.tsx` composes the canvas with DOM overlays and the input provider.

Scene responsibilities include:

- camera configuration;
- ambient and directional lighting;
- the parquet floor and environment;
- player rendering;
- per-frame updates required by the scene.

Game-owned static assets live in `apps/game/public`. Asset URLs must respect Vite's configured base path. During local development the game normally runs at `/`; a subdirectory deployment can set `PUBLIC_GAME_BASE`, for example `/game/`.

## Local 3D components

Small scene elements may remain close to `CanvasScene` while they are simple. Move an element into its own file when it gains independent state, loading behavior, reusable logic, or substantial rendering code. Avoid fragmentation that creates files with no meaningful ownership.

## WebGL resilience and mobile behavior

The canvas is protected by `GameCanvasErrorBoundary`. Loading and failure states should remain understandable without exposing raw rendering errors to players.

Mobile constraints are part of the architecture:

- avoid unnecessary canvas mounts;
- keep draw calls, geometry, materials, and texture size under control;
- do not allocate objects repeatedly inside the render loop;
- preserve DOM-based controls and HUD where 3D rendering adds no value;
- treat context loss and unsupported WebGL as recoverable presentation states.

## Player and motion

`Player.tsx` renders the current player representation. Motion intent comes from the canonical input layer and is translated through gameplay state before affecting the rendered player.

The architecture should continue to separate:

```text
physical device
→ input adapter
→ canonical action or vector
→ gameplay controller/state
→ player motion state
→ rendered player
```

Device adapters must not manipulate Three.js objects directly.

## Input architecture

`GameInputProvider` owns the shared input lifecycle. Keyboard/mouse, gamepad, and touch adapters produce the same gameplay-facing contract. The active source can change without changing player logic.

The input map is functional configuration, not documentation only: keyboard codes and gamepad indices determine runtime behavior. Options screens that change bindings must update the mappings consumed by the adapters.

See the repository-level [Input Manager documentation](../../../docs/input-manager.md) for the detailed contract.

## HUD and DOM overlays

HUD elements remain HTML layered over the canvas. This is preferred for text, menus, diagnostics, buttons, and accessibility-sensitive controls.

`GamePlayHUD` owns player-facing gameplay information. Training diagnostics should remain clearly distinct from release UI and should not leak device-specific details into gameplay state.

## Persistent fullscreen ownership

Fullscreen controls live above individual screen content so they survive menu-to-gameplay transitions. The component observing `document.fullscreenElement` must not be remounted every time the selected game screen changes.

There are two relevant contexts:

- Standalone game: the game document requests fullscreen for `#bboyarena-game-root`.
- Website iframe: the outer website may fullscreen the iframe while the inner game still treats its own root as the runtime target.

Client-side checks that encourage iframe use are product presentation controls, not security authorization. A statically deployed game URL remains publicly reachable when known.

## Zustand and XState

The two libraries serve different roles:

- Zustand stores mutable shared data that React components need to read frequently, such as UI, game, and input values.
- XState defines valid lifecycle transitions between `idle`, `playing`, `paused`, and `gameOver`.

Do not duplicate lifecycle truth across scattered booleans. Do not put every changing render value into the state machine.

## Screen selection and React Router

React Router is currently unnecessary for internal game screens. Local state is simpler while screens do not require unique URLs, browser history, deep links, or independent page-level loading.

Introduce a router only when at least one concrete requirement needs it, such as:

- shareable or reload-safe screen URLs;
- meaningful browser back/forward behavior;
- route-level code splitting;
- independently addressable editor or administration screens.

Until then, keep the existing screen selector explicit and typed.

## Adding a new screen

1. Add the screen identifier to the existing screen type.
2. Create a focused DOM or gameplay component under `apps/game/src/game/ui` or the appropriate runtime folder.
3. Add the selection branch in `GameApp`.
4. Mount `GamePlayScene` only if the screen needs WebGL.
5. Keep fullscreen ownership outside the replaceable stage.
6. Add localized copy under `apps/game/src/game/locales`.
7. Verify keyboard, touch, and gamepad behavior where the screen is interactive.

## Glossary

- Canvas: the DOM element used by WebGL.
- Scene: the Three.js object graph rendered by the canvas.
- React Three Fiber: React renderer for Three.js.
- Drei: helper components and hooks for React Three Fiber.
- DOM overlay: HTML interface positioned above or around the canvas.
- Canonical action: device-independent gameplay intent.
- Input adapter: translator between a physical-device API and canonical input.
- Screen selector: the current local-state mechanism used to choose game content.

## Related documentation

- [Game README](../README.md)
- [UI development guide](./ui-development.md)
- [Input Manager](../../../docs/input-manager.md)
- [Current repository architecture](../../../docs/current-architecture.md)
