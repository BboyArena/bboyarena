# Development Log

This is a historical summary of the major foundations built for BboyArena. It is not a line-by-line changelog and may describe earlier intermediate states. For the current source of truth, use the [project specification](../PROJECT_SPEC.md) and [current architecture](./current-architecture.md).

## Public website foundation

The project evolved from a small Astro/React prototype into a complete public surface with:

- a clear BboyArena identity and manifesto;
- community, founding crew, open-development, contact, and legal pages;
- categorized news and devlogs;
- localized routes and copy;
- responsive navigation and a global footer;
- SEO, canonical URLs, social metadata, JSON-LD, sitemap, and robots directives.

The public copy was deliberately changed from generic product language to an honest description of an early breaking-culture project. The website must not present planned gameplay as already released.

## PWA and deployment

The Astro application gained a production PWA foundation:

- a generated web app manifest;
- Android and Apple icons;
- an auto-updating service worker;
- static asset precaching;
- custom-domain and GitHub Pages base-path support;
- a static build written to root `dist/`.

PWA behavior is intentionally disabled during normal local development to avoid stale service workers and confusing cache behavior.

## SEO and domain configuration

The website was aligned with `bboyarena.org`. SEO settings are configurable through environment variables, while sensible BboyArena defaults remain in the Astro configuration and layout.

Article pages support publication and modification dates, authorship, sections, tags, canonical URLs, Open Graph, Twitter cards, and structured data.

## Home, panorama, and devlog fallback

The home page became the main editorial entry point. It combines project context, calls to action, and current development material.

An interactive panorama was introduced as a visual fallback when a live devlog source is unavailable. A non-WebGL fallback preserves the editorial content when the panorama cannot load.

## News and data sources

News was divided into three streams:

- `devlog` for project development;
- `app` for product and application updates;
- `scene` for external breaking-scene content.

Local entries provide a dependable static baseline. PocketBase can supply remote devlogs, and a configured external feed can supply scene items. External material keeps its source attribution and canonical URL.

## Localization

The localization layer was split into shared types, route helpers, shared copy, news copy, and page-focused content. The supported locales are English (US), Italian, Latin American Spanish, Brazilian Portuguese, and Simplified Chinese.

## Legal, privacy, analytics, and support

Reusable legal-page rendering was created for privacy, cookies, terms, open development, and contact information. Analytics is optional and privacy-aware. The browser-local `bboyarena-no-tracking` flag disables tracking for that origin and profile.

Supporter links for Buy Me a Coffee and Patreon are controlled by explicit master and provider feature flags. Invalid or disabled URLs remain hidden.

## Website and game separation

The game initially lived inside the Astro source tree with development routes and shared styling. It was later extracted into the standalone `apps/game` Vite application.

The completed boundary is:

```text
website → iframe or URL → standalone game
```

The website no longer imports game runtime modules. The game owns its Three.js scene, input system, state, UI, CSS, localization, and static assets. See the archived [game separation plan](./archive/game-separation-plan.md) for migration history and [current architecture](./current-architecture.md) for the active boundary.

## Game UI and input foundation

The game gained:

- a DOM-based menu and HUD layer;
- fullscreen controls;
- a React Three Fiber scene boundary;
- Zustand stores and an XState lifecycle machine;
- keyboard/mouse, touch, virtual joystick, gesture, and gamepad input;
- canonical input actions independent of physical devices;
- localized game copy.

The game remains an early technical foundation rather than a complete gameplay loop.

## Development utilities

The Astro development router currently exposes component, Tailwind, UI, and leaderboard sandboxes only in development mode. The localStorage tool was promoted from a development route to the public, `noindex` privacy helper at `/privacy/localstorage-inspector`.

## Verification history

Work in this phase was repeatedly checked through Astro static builds, standalone Vite game builds, route generation, responsive review, and Git diff validation. Large JavaScript bundle warnings remain optimization opportunities rather than build failures.

## Recommended continuation

1. Build a small but complete gameplay loop.
2. Continue validating unified input across keyboard, touch, and gamepad.
3. Keep remote editorial sources optional and failure-tolerant.
4. Reduce large client bundles where it materially improves loading.
5. Keep current-state documentation separate from archived plans and historical notes.

## Related documentation

- [Documentation index](./README.md)
- [Project specification](../PROJECT_SPEC.md)
- [Current architecture](./current-architecture.md)
- [Game scene architecture](../apps/game/docs/threejs-scene-architecture.md)
