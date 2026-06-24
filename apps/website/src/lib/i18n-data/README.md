# i18n structure

The project keeps localized copy grouped by page or area, with locale variants inside each module.

## Current map

- `src/lib/pages/home.ts`
  - Home page copy
- `src/lib/pages/manifesto.ts`
  - Manifesto page copy
- `src/lib/pages/legal.ts`
  - Privacy, cookies, terms, open-development, contact
- `src/lib/i18n-data/site/shared.ts`
  - Global navigation, footer, and language switcher labels
- `src/lib/i18n-data/site/news.ts`
  - News hub, category pages, and article metadata labels
## Rule of thumb

- If the text belongs to one route, keep it in that page module.
- If the text is shared across the site, keep it in `site/shared.ts`.
- If the text is only for the game, keep it inside the game app, currently `apps/game/src/game/copy.ts`.
- Add a new file when a page or area starts carrying enough text to feel noisy in the parent module.
