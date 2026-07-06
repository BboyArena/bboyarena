# Legacy Development Notes

> Archived document. These notes describe the former monolithic Astro/React prototype and are retained only for historical context. Use the [project specification](../../PROJECT_SPEC.md) for current information.

## Earlier design

The prototype combined website routing, a React game shell, Three.js rendering, UI state, gameplay lifecycle state, PWA behavior, and optional Supabase integration in one application.

Its mental model was:

```text
Astro route and global layout
→ React game shell
→ Three.js canvas
→ player and HUD
→ Zustand shared state
→ XState lifecycle
```

The visual direction was already street-inspired, with warm concrete colors, graffiti references, arcade HUD elements, and a deliberately rougher identity than a conventional corporate interface.

## Earlier routes and components

The old notes referred to routes such as `/play` and `/leaderboard`, and to game components under the website source directory. Those paths were transitional and have been superseded by the standalone game application and `/play-the-game` website showroom.

## Concepts that remain valid

- Astro owns the public website and static routing.
- React owns interactive client interfaces.
- React Three Fiber owns the 3D scene.
- Zustand holds shared mutable data.
- XState constrains lifecycle transitions.
- Device-specific input should remain outside gameplay logic.
- Backend configuration should be optional during local front-end work.
- Public claims should reflect the real maturity of the game.

## Concepts that changed

- The game no longer imports into the Astro application.
- Website and game assets have separate ownership.
- The game has its own Vite development and build commands.
- Current public and localized routes differ from the prototype route map.
- Analytics opt-out now has a public privacy helper instead of requiring console commands.

## Current references

- [Repository README](../../README.md)
- [Project specification](../../PROJECT_SPEC.md)
- [Current architecture](../current-architecture.md)
- [Game application README](../../apps/game/README.md)
- [Input Manager](../input-manager.md)
