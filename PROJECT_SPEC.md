# BboyArena.org — Project Specification

This living document is the canonical reference for the repository's current applications, routes, major components, integrations, and operating conventions. Architectural boundaries are expanded in [`docs/current-architecture.md`](./docs/current-architecture.md).

## 1. Project identity and current scope

- BboyArena is an independent, community-driven project about breaking culture, creative movement, and experimental browser game development.
- The public website is the stable communication surface for the project, its manifesto, news, legal information, community participation, and development progress.
- The game is an early standalone application with a 3D scene, input infrastructure, UI experiments, and state foundations. It is not yet a complete playable release.
- The visual direction is street-inspired, warm, readable, and intentionally non-corporate.
- Development should remain incremental, honest about the project's state, and biased toward playable progress rather than speculative infrastructure.

## 2. Repository architecture

The repository contains independent deployable applications and shared packages:

```text
.
├── apps/
│   ├── website/       # Astro public website
│   ├── game/          # Standalone Vite/React game
│   ├── server/        # Hono API server
│   └── colyseus/      # Experimental Colyseus server
├── packages/
│   ├── shared/        # Shared Zod schemas and TypeScript contracts
│   └── sdk/           # Client SDK for BboyArena APIs
├── agents/            # AI coding-assistant role definitions
├── docs/              # Architecture and technical reports
├── legal/             # Governance, licensing, and contribution documents
├── docker/            # Local infrastructure configuration
├── docker-compose.yml
└── package.json       # Root commands and shared dependencies
```

Website code must live under `apps/website`; game runtime code must live under `apps/game`. Do not recreate a root `src/` directory or import the game runtime into the website.

## 3. Technology stack

### Website

- Astro 5 with static output and file-based routing
- React 19 for interactive islands
- TypeScript
- Tailwind CSS 4 through the Vite plugin
- `@vite-pwa/astro` for the web app manifest, service worker, and offline asset caching
- Astro Sitemap for sitemap generation
- PocketBase support for remotely managed devlogs
- Supabase client support for future data integration
- Photo Sphere Viewer for panoramic content
- `marked` for Markdown rendering

### Game

- Vite with React 19 and TypeScript
- Three.js, React Three Fiber, and Drei
- Zustand for game and input stores
- XState for the game state machine
- Tailwind CSS 4 plus game-owned handcrafted CSS
- `nipplejs` for the virtual joystick

### Server and local infrastructure

- A Hono API server under `apps/server`
- An experimental Colyseus WebSocket server under `apps/colyseus`
- Docker Compose services for the API, PocketBase, Traefik, the website, Colyseus, PostgreSQL, and a self-hosted Supabase stack

## 4. Application boundaries and build output

### Website ownership

- Source: `apps/website/src`
- Static assets: `apps/website/public`
- Configuration: `apps/website/astro.config.mjs`
- Production output: root `dist/`
- Default development URL: `http://localhost:4321/`

The website is statically generated. Its base path adapts to a custom domain, GitHub Pages project deployment, or `ASTRO_BASE_PATH`.

### Game ownership

- Runtime: `apps/game/src/game`
- Standalone entry point: `apps/game/src/main.tsx`
- Static assets: `apps/game/public`
- Configuration: `apps/game/vite.config.mjs`
- Production output: root `dist-game/`
- Development URL: `http://localhost:4322/`
- Preview URL: `http://localhost:4323/`

The website integrates the game only through an iframe/URL boundary on `/play-the-game`. `PUBLIC_GAME_EMBED_URL` selects the deployed game URL; development falls back to `http://localhost:4322/`.

## 5. Root commands

- `npm run dev` — run the Astro website.
- `npm run dev:all` — run the website and standalone game together.
- `npm run build` — build the website into `dist/`.
- `npm run preview` — preview the website build.
- `npm run astro` — run the Astro CLI against `apps/website`.
- `npm run game:dev` — run the standalone game.
- `npm run game:build` — build the game into `dist-game/`.
- `npm run game:preview` — preview the game build.

Node.js 22.12.0 or newer is required.

## 6. Public website routes

English (`en-US`) is the unprefixed default locale. Unless noted otherwise, every route below also has localized variants under `/it`, `/es`, `/pt-br`, and `/zh`.

### Main and community routes

- `/`
- `/manifesto`
- `/founding-crew`
- `/play-the-game`
- `/moves`
- `/moves/{family}`
- `/moves/{family}/{move}`
- `/open-development`
- `/contact`

### News routes

- `/news`
- `/news/devlog`
- `/news/app`
- `/news/scene`
- `/news/{category}/{slug}`

The supported categories are `devlog`, `app`, and `scene`. Content can come from local records, PocketBase devlogs, or a configured external scene feed.

### Legal and privacy routes

- `/privacy`
- `/privacy/localstorage-inspector`
- `/cookies`
- `/terms`

The localStorage inspector is a public, `noindex` browser-only privacy helper. It reads, writes, and clears origin-scoped localStorage and controls the `bboyarena-no-tracking` flag. It is linked from the Privacy Policy and has all localized route variants, although its current UI copy is shared rather than translated per locale.

### Utility routes

- `/404`
- `/robots.txt`

### Development-only routes

The `[...dev].astro` router emits these pages only when Astro runs in development mode:

- `/__dev/tailwind-showcase`
- `/__dev/component-lab`
- `/__dev/ui-demo`
- `/__dev/leaderboard`

The former `/__dev/localstorage` route has been removed in favor of the public privacy helper.

## 7. Localization

Supported locale codes and URL prefixes are:

| Locale | URL prefix |
| --- | --- |
| `en-US` | none |
| `it-IT` | `/it` |
| `es-419` | `/es` |
| `pt-BR` | `/pt-br` |
| `zh-Hans` | `/zh` |

Localization configuration and path helpers live in `apps/website/src/lib/i18n.ts`. Shared and page-specific translated copy lives under `apps/website/src/lib/i18n-data/site`. `Layout.astro` generates localized alternates and canonical metadata from the common page path.

## 8. Major website components

### Global layout and navigation

- `apps/website/src/components/layout/Layout.astro` owns the document shell, global navigation, footer, SEO metadata, canonical URL, locale alternates, social metadata, structured data, analytics loading, and PWA-related behavior.
- `apps/website/src/components/navigation/SiteNavigation.astro` owns desktop/mobile navigation and locale switching.
- `apps/website/src/components/navigation/HomeLogo.astro` provides the home link and project mark.

### Page components

- `HomePage.astro` — project introduction, current activity, calls to action, and recent news.
- `ManifestoPage.astro` — the project's narrative and principles.
- `FoundingCrewPage.astro` — early community participation.
- `PlayTheGamePage.astro` — iframe showroom and fallback messaging for the standalone game.
- `LegalPage.astro` — shared renderer for privacy, cookies, terms, open development, and contact content; supports paragraphs, lists, contact rows, link cards, and callouts.
- `LocalStorageInspectorPage.astro` — browser storage and no-tracking controls.

### Supporting components

- `SecondaryCTA.astro` and `SupportProject.astro` provide reusable calls to action and optional supporter links.
- `MarkdownBody.astro` renders editorial Markdown.
- `DevlogPwaGate.astro` handles PWA-specific devlog behavior.
- `PanoramaViewer.tsx` and `PanoramaFallback.astro` provide interactive and fallback panoramic content.

## 9. Website data and support libraries

- `lib/base.ts` — deployment base-path utilities.
- `lib/i18n.ts`, `lib/i18n-types.ts`, and `lib/i18n-data/` — locale configuration, types, routing helpers, and translated copy.
- `lib/seo.ts` — SEO URL and metadata helpers.
- `lib/news.ts` — news types, categories, local content, PocketBase aggregation, and external feed handling.
- `lib/pocketbase.ts` — PocketBase configuration and record normalization.
- `lib/pages/home.ts`, `lib/pages/manifesto.ts`, and `lib/pages/legal.ts` — page copy and content models.
- `lib/pwa-analytics.ts` — privacy-aware PWA analytics behavior.
- `lib/supabase.ts` — optional Supabase browser client.
- `lib/support.ts` — supporter-link feature flags and validation.
- `data/navigation.json` — primary navigation keys and paths.

## 10. Game runtime

`apps/game/src/game` owns the complete standalone runtime:

- `GameApp.tsx` — top-level game application.
- `CanvasScene.tsx` and `GamePlayScene.tsx` — Three.js/R3F scene composition.
- `Player.tsx` — current player representation.
- `ui/` — menu, HUD, gameplay HUD, panels, scroll areas, fullscreen controls, touch overlay, demo scene, and canvas error boundary.
- `state/gameMachine.ts` — XState lifecycle states: idle, playing, paused, and game over.
- `state/useGameStore.ts` and `state/useInputStore.ts` — Zustand state boundaries.
- `motion/` — semantic intent resolution, XState player motion, transition rules, and accepted move history.
- `input/` — unified keyboard/mouse, touch, virtual joystick, gesture, and gamepad input infrastructure.
- `rhythm/` — global fixed-step musical clock driven by the game BPM.
- `audio/` — internal music playback and the Training manual-BPM metronome. “Bring Your Music” never captures external audio: the user plays music independently and sets the session tempo through the touch R1 Tap BPM control; the 4/4 HUD is read-only feedback. The metronome temporarily occupies the future basic drum-solo track slot.
- `move/` — authored move phases, loops, cues, skills, transitions, and frame-to-beat normalization.
- `replay/` — versioned replay contracts and future deterministic timeline support.
- `locales/` — game copy for the same five supported locales as the website.

Input devices must produce canonical game actions through the input layer; they must not control the player directly. Rendering, gameplay, UI, and input responsibilities should remain separate.

## 11. Experimental server

`apps/colyseus` contains an early multiplayer scaffold, not a production gameplay dependency. It currently provides:

- an HTTP health endpoint at `/health`;
- a `battle` room with a maximum of eight clients;
- basic player join/leave state;
- `joinCrew`, `ping`, and `pong` messages.

Do not describe multiplayer as a released game feature.

## 12. SEO, PWA, analytics, and privacy

- The default site URL is `https://bboyarena.org`.
- The default site name and title are `BboyArena.org`.
- `Layout.astro` owns title, description, canonical URL, locale alternates, Open Graph, Twitter cards, and JSON-LD.
- Editorial pages may use article metadata including publication/modification times, section, tags, and author.
- The website is statically generated with a sitemap, `robots.txt`, PWA manifest, auto-updating service worker, and offline asset caching.
- Analytics is optional and configured through public environment variables.
- Setting `bboyarena-no-tracking` to `1` in localStorage disables analytics for that browser.
- The public legal copy states that analytics is self-hosted and that profiling cookies are not used.

## 13. Design and content conventions

- Preserve the warm street/underground identity without sacrificing readability.
- Prefer robust, simple layouts and small reusable components.
- Long-form content should use a readable maximum width.
- The global header is sticky; desktop footers use columns; mobile layouts stack vertically.
- Use buttons for real actions and calls to action, not for ordinary navigation links.
- Keep public claims accurate: planned features must never be presented as complete.
- Public-facing copy should be clear, welcoming, culturally respectful, and free of corporate hype.
- Maintain mobile usability and accessibility whenever changing structure or interaction.

## 14. Environment configuration

Environment variables are loaded from the repository root. Browser-exposed variables used by the website should also be declared in `apps/website/src/env.d.ts`.

### Deployment and application

- `PUBLIC_SITE_URL`
- `ASTRO_BASE_PATH`
- `PUBLIC_APP_VERSION`
- `PUBLIC_GAME_EMBED_URL`
- `PUBLIC_GAME_BASE` (standalone game build)
- `PUBLIC_ANIMATION_CATALOG_URL` (optional remote animation catalog with local fallback)

### Data and content

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_POCKETBASE_URL`
- `PUBLIC_POCKETBASE_DEVLOGS_COLLECTION`
- `PUBLIC_POCKETBASE_DEVLOGS_FILTER`
- `PUBLIC_NEWS_EXTERNAL_FEED_URL`
- `PUBLIC_NEWS_EXTERNAL_SOURCE_NAME`
- `PUBLIC_NEWS_EXTERNAL_SOURCE_URL`

### Community, contact, and support

- `PUBLIC_GITHUB_URL`
- `PUBLIC_DISCORD_URL`
- `PUBLIC_INSTAGRAM_URL`
- `PUBLIC_YOUTUBE_URL`
- `PUBLIC_CONTACT_EMAIL`
- `PUBLIC_NEWSLETTER_URL`
- `PUBLIC_SUPPORT_ENABLED`
- `PUBLIC_BUYMEACOFFEE_ENABLED`
- `PUBLIC_BUYMEACOFFEE_URL`
- `PUBLIC_PATREON_ENABLED`
- `PUBLIC_PATREON_URL`

### Analytics and SEO

- `PUBLIC_ANALYTICS_SCRIPT_URL`
- `PUBLIC_ANALYTICS_WEBSITE_ID`
- `PUBLIC_SEO_SITE_NAME`
- `PUBLIC_SEO_TITLE`
- `PUBLIC_SEO_DESCRIPTION`
- `PUBLIC_SEO_OG_IMAGE`
- `PUBLIC_SEO_OG_IMAGE_ALT`
- `PUBLIC_SEO_LOGO`
- `PUBLIC_SEO_LOCALE`
- `PUBLIC_SEO_TWITTER_SITE`
- `PUBLIC_SEO_TWITTER_CREATOR`
- `PUBLIC_SEO_AUTHOR`

## 15. AI agent role definitions

The `agents/` directory contains operational prompts for AI coding assistants. The implemented role files are:

- `website-community-agent.md`
- `gameplay-agent.md`
- `input-agent.md`
- `rendering-agent.md`
- `devlog-agent.md`

Additional roles may be added when they receive a corresponding charter. These prompts are development aids, not runtime code or authoritative replacements for this specification.

## 16. Governance and documentation

- `legal/` contains the contribution, governance, licensing scope, commercial-use, trademark, certification, and CLA documents.
- `docs/current-architecture.md` defines the active website, game, and server boundaries without repeating this specification's complete inventory.
- Current focused guides cover scene architecture and input management; completed migration reports are retained under `docs/archive/`.
- `docs/development-log.md`, `ROADMAP.md`, and the application READMEs provide historical and focused context; this file remains the broad current-state reference.
- `docs/README.md` is the documentation index and defines documentation placement and linking rules.

## 17. Recent changes reflected here

This revision includes the recent privacy-tool and development-role changes:

- the localStorage inspector moved from the development router to public and localized privacy routes;
- the Privacy Policy gained a link card pointing to that helper;
- `LegalPage.astro` gained reusable linked-resource cards;
- the former development-only localStorage page and route were removed;
- the new `agents/` role definitions were added to the repository.

## 18. Documentation organization

- Root entry points: [`README.md`](./README.md), [`LICENSE.md`](./LICENSE.md), [`PROJECT_SPEC.md`](./PROJECT_SPEC.md), and [`ROADMAP.md`](./ROADMAP.md).
- Repository documentation index: [`docs/README.md`](./docs/README.md).
- Current technical documentation and historical reports: `docs/`.
- Superseded documents retained for context: `docs/archive/`.
- Application-specific guides: the owning application's `docs/` directory or README.
- Governance and licensing documents: `legal/`.
- AI role definitions: `agents/`.

All documentation must be written in English and use repository-relative paths. Machine-specific absolute paths and developer usernames must not appear in committed documentation.

## 19. Operational rules

- Prefer incremental, reviewable changes and avoid new dependencies without a concrete need.
- Keep the website static unless a real requirement demands otherwise.
- Preserve the iframe/URL boundary between the website and game.
- Keep application-owned assets inside the corresponding app's `public/` directory.
- Update documentation when route structure, application ownership, environment variables, or major architectural boundaries change.
- Run the relevant website or game build after structural changes and leave the affected application buildable.
