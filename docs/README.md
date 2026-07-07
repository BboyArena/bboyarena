# Documentation Index

This directory contains repository-wide technical documentation. Paths in every document are relative to the repository; local machine paths must never be committed.

## Document authority

| Document | Purpose | Authority |
| --- | --- | --- |
| [`README.md`](../README.md) | Public introduction and contributor entry point | Public project summary |
| [`PROJECT_SPEC.md`](../PROJECT_SPEC.md) | Current repository inventory, routes, stack, configuration, and conventions | Canonical implementation reference |
| [`current-architecture.md`](./current-architecture.md) | Runtime ownership, allowed dependencies, and integration boundaries | Canonical architecture boundary |
| [`ROADMAP.md`](../ROADMAP.md) | Accepted product and technical direction | Canonical roadmap |
| [`LICENSE.md`](../LICENSE.md) and [`legal/`](../legal/) | Licensing, governance, contribution, and brand rules | Canonical policy documents |
| [`development-log.md`](./development-log.md) | Narrative history of completed foundations | Historical context only |
| [`archive/`](./archive/) | Superseded audits, plans, and notes | Non-authoritative history |

Focused application guides are authoritative only within their stated component or workflow. They must defer to the project specification and current architecture on repository-wide questions.

## Current documentation

- [Project specification](../PROJECT_SPEC.md) — broad source of truth for current scope, routes, architecture, and conventions.
- [Current architecture](./current-architecture.md) — ownership boundaries between the website and standalone game.
- [Development log](./development-log.md) — historical summary of major completed foundations.
- [Input Manager](./input-manager.md) — canonical multi-device input architecture.

## Application documentation

- [Game application README](../apps/game/README.md)
- [Game scene and screen architecture](../apps/game/docs/threejs-scene-architecture.md)
- [Game move catalog](../apps/game/docs/move-catalog.md)
- [Game UI development guide](../apps/game/docs/ui-development.md)
- [Player motion, animation, and replay plan](../apps/game/docs/plan.md)
- [Website localization data guide](../apps/website/src/lib/i18n-data/README.md)

## Archived documentation

- [Legacy project README](./archive/legacy-readme.md)
- [Legacy development notes](./archive/legacy-development-notes.md)
- [Game runtime coupling report](./archive/game-runtime-coupling-report.md) — audit created before the website/game separation.
- [Game separation plan](./archive/game-separation-plan.md) — completed migration plan.
- [Project folder structure report](./archive/project-folder-structure-report.md) — repository analysis from the transitional structure.

Archived files are retained for historical context and are not current implementation guidance. When an archive conflicts with the project specification or current architecture, the current documents take precedence.

## Documentation rules

1. Write documentation in English.
2. Link with paths relative to the document containing the link.
3. Never include a developer username, home directory, or machine-specific absolute path.
4. Keep conventional entry files in the repository root: `README.md`, `LICENSE.md`, `PROJECT_SPEC.md`, and `ROADMAP.md`.
5. Put repository-wide technical documentation in `docs/` and app-specific documentation beside the owning app.
6. Move obsolete but historically useful documents to `docs/archive/` and label them clearly.
