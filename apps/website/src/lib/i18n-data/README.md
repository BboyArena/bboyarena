# i18n structure

The project keeps localized copy grouped by page or area, with locale variants inside each module.

## Current map

- `apps/website/src/lib/pages/home.ts`
  - Home page copy
- `apps/website/src/lib/pages/manifesto.ts`
  - Manifesto page copy
- `apps/website/src/lib/pages/legal.ts`
  - Privacy, cookies, terms, open-development, contact
- `apps/website/src/lib/i18n-data/site/shared.ts`
  - Global navigation, footer, and language switcher labels
- `apps/website/src/lib/i18n-data/site/news.ts`
  - News hub, category pages, and article metadata labels
## Rule of thumb

- If the text belongs to one route, keep it in that page module.
- If the text is shared across the site, keep it in `site/shared.ts`.
- If the text is only for the game, keep it under `apps/game/src/game/locales/` and access it through the game copy boundary.
- Add a new file when a page or area starts carrying enough text to feel noisy in the parent module.
