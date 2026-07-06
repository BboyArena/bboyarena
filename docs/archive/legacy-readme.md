# Legacy Project README

> Archived document. This file records the repository's earlier single-application structure. Its commands, paths, routes, and architecture are not authoritative. Use the current [repository README](../../README.md) and [project specification](../../PROJECT_SPEC.md).

## Historical context

The project originally presented itself as a casual browser-based 3D breaking game built directly inside one Astro application. The early stack already included Astro, React, TypeScript, Tailwind CSS, Three.js, React Three Fiber, Zustand, XState, PWA support, and a prepared Supabase client.

At that stage:

- website and game code shared a source tree;
- game demos were exposed through Astro development routes;
- production output targeted `dist/` for GitHub Pages;
- environment variables were expected in a root `.env` file;
- the news area already anticipated `devlog`, `app`, and `scene` categories;
- Docker Compose provided experimental local services.

## Why this document is archived

The repository now has separate website and game applications:

```text
apps/website
apps/game
```

The standalone game is embedded by URL rather than imported into Astro. Many old paths such as root `src/`, `/play`, and internal game demo routes no longer exist. Preserving the original README as active documentation would therefore be misleading.

## Current references

- [Repository README](../../README.md)
- [Project specification](../../PROJECT_SPEC.md)
- [Current architecture](../current-architecture.md)
- [Development log](../development-log.md)
