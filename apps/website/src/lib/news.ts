import { withBasePath } from './base';
import { getPocketBaseConfig, normalizePocketBaseTags, type PocketBaseDevlogRecord } from './pocketbase';

export type NewsCategory = 'devlog' | 'app' | 'scene';

export interface NewsCategoryMeta {
  slug: NewsCategory;
  label: string;
  title: string;
  description: string;
  accent: string;
}

export interface NewsItemBase {
  category: NewsCategory;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  image?: string;
  imageAlt?: string;
  tags: string[];
}

export interface LocalNewsItem extends NewsItemBase {
  sourceKind: 'local';
  body: string[] | string;
}

export interface ExternalNewsItem extends NewsItemBase {
  sourceKind: 'external';
  sourceName: string;
  sourceUrl: string;
  canonicalUrl: string;
}

export type NewsItem = LocalNewsItem | ExternalNewsItem;

export const NEWS_CATEGORIES: Record<NewsCategory, NewsCategoryMeta> = {
  devlog: {
    slug: 'devlog',
    label: 'Devlog',
    title: 'Devlog',
    description: 'Behind the scenes of the project: build, art direction, gameplay, and technical choices.',
    accent: '#7c8f4c'
  },
  app: {
    slug: 'app',
    label: 'App News',
    title: 'App News',
    description: 'Updates, features, bug fixes, and app workflow changes.',
    accent: '#bc613a'
  },
  scene: {
    slug: 'scene',
    label: 'Scene News',
    title: 'Scene News',
    description: 'Real news pulled from an external source and surfaced inside the project.',
    accent: '#5f5346'
  }
};

const LOCAL_NEWS: LocalNewsItem[] = [
  {
    category: 'devlog',
    slug: 'development-log-public-surface-pwa-game-ui',
    sourceKind: 'local',
    title: 'Development log: public surface, PWA, and game UI foundation',
    description:
      'A full recap of the recent work on BboyArena: the public site, PWA setup, devlog system, panorama fallback, and the first isolated game UI layer.',
    excerpt:
      'The project now has a stronger public surface, a working PWA foundation, a real devlog path, and a separated game UI sandbox for the next phase.',
    publishedTime: '2026-06-23T08:20:00+02:00',
    modifiedTime: '2026-06-23T08:20:00+02:00',
    author: 'BboyArena',
    image: '/readme-banner.png',
    imageAlt: 'BboyArena public development banner',
    tags: ['devlog', 'pwa', 'astro', 'game-ui', 'open-development'],
    body: [
      'This devlog collects the main development work completed across the last few days. BboyArena moved from a simple Astro and React project into a more complete public surface for the future browser game.',
      'The PWA foundation has been cleaned up for Android Chrome, iOS support, GitHub Pages, and the custom bboyarena.org domain. The manifest, icons, service worker, app theme color, sitemap, robots file, and SEO metadata now have a clearer production path.',
      'The homepage has also changed direction. It now presents the project as an open, independent breaking culture project instead of a generic technical demo. The README was rewritten for players and community members, with a visual banner and a clearer explanation of the current early-stage status.',
      'The devlog area no longer relies on invented placeholder posts. When no live content exists, the latest devlog space becomes an interactive panoramic scene, with an editorial overlay and a direct call to read the devlog archive.',
      'A PocketBase path is ready for future live devlogs, so new records can appear without rebuilding the site. Until then, local devlog posts like this one keep the site honest and useful.',
      'The game UI has been split away from the global Astro and Tailwind styling. The new game root, dedicated game CSS, fullscreen controls, HUD components, 2D menu states, and internal dev pages give the game a separate visual language that can evolve without leaking into the public site.',
      'The i18n structure was reorganized too. Page copy now lives in page-specific files, while shared site, news, and game copy lives under a dedicated i18n data folder. That should make future edits much easier to find.',
      'The next step is to write smaller, real devlogs as the project moves forward: one for PWA updates, one for the visual direction, one for the game UI, and one for the first gameplay prototype.'
    ]
  },
  {
    category: 'app',
    slug: 'news-hub-structure',
    sourceKind: 'local',
    title: 'The news section now supports three categories',
    description: 'Devlog, app news, and an external section for the live scene.',
    excerpt: 'We separated the project communication into three clear streams so every piece of content has its place.',
    publishedTime: '2026-06-18T11:00:00+02:00',
    modifiedTime: '2026-06-18T11:20:00+02:00',
    author: 'Breakdance 3D Team',
    image: '/og-image.png',
    imageAlt: 'Sezione news di Breakdance 3D',
    tags: ['app', 'news', 'structure'],
    body: [
      'The news section was designed to clearly separate internal work, product updates, and external updates.',
      'Each category has its own archive, tone, and SEO rules.',
      'This way we can grow without mixing changelog posts, devlog entries, and scene news.'
    ]
  },
  {
    category: 'app',
    slug: 'seo-pipeline-upgrade',
    sourceKind: 'local',
    title: 'SEO pipeline: meta, canonical, and schema are ready for editorial content',
    description: 'The layout now handles advanced metadata for articles and news pages too.',
    excerpt: 'We set up canonical, Open Graph, Twitter, and JSON-LD so every news page behaves well.',
    publishedTime: '2026-06-18T11:25:00+02:00',
    author: 'Breakdance 3D Team',
    image: '/og-image.png',
    imageAlt: 'SEO metadata di Breakdance 3D',
    tags: ['app', 'seo', 'schema'],
    body: [
      'The layout reuses a shared helper to build metadata consistently.',
      'News pages can use `type="article"` and declare dates, author, section, and tags.',
      'The external section can be marked noindex when the article points to the original source.'
    ]
  }
];

let cachedAllNewsItemsPromise: Promise<NewsItem[]> | null = null;
let cachedExternalSceneItemsPromise: Promise<ExternalNewsItem[]> | null = null;
let cachedPocketBaseDevlogItemsPromise: Promise<LocalNewsItem[]> | null = null;

const FEED_URL = import.meta.env.PUBLIC_NEWS_EXTERNAL_FEED_URL?.trim();
const FEED_SOURCE_NAME = import.meta.env.PUBLIC_NEWS_EXTERNAL_SOURCE_NAME?.trim() || 'Fonte esterna';
const FEED_SOURCE_URL = import.meta.env.PUBLIC_NEWS_EXTERNAL_SOURCE_URL?.trim();
const EXTERNAL_MAX_ITEMS = 8;

const stripHtml = (value: string) =>
  value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const pickTagList = (value: string, fallback: string[]) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6)
    .concat(fallback);

const resolvePublishedTime = (value?: string) => {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
};

const normalizeBody = (body?: string[] | string): string[] | string => {
  if (Array.isArray(body)) {
    return body.map((paragraph) => String(paragraph).trim()).filter(Boolean);
  }

  return typeof body === 'string' ? body.trim() : '';
};

const mapPocketBaseDevlogRecord = (record: PocketBaseDevlogRecord): LocalNewsItem => {
  const title = String(record.title || 'Untitled devlog').trim();
  const description = String(record.description || record.excerpt || title).trim();
  const excerpt = String(record.excerpt || record.description || title).trim();
  const body = normalizeBody(record.body);
  const resolvedBody =
    typeof body === 'string'
      ? body
      : body.length > 0
        ? body
        : [excerpt || description || title];

  return {
    category: 'devlog',
    slug: String(record.slug || '').trim() || slugify(title),
    sourceKind: 'local',
    title,
    description,
    excerpt,
    publishedTime: resolvePublishedTime(record.publishedTime),
    modifiedTime: record.modifiedTime ? resolvePublishedTime(record.modifiedTime) : undefined,
    author: String(record.author || 'BboyArena').trim() || 'BboyArena',
    image: record.image?.trim() || undefined,
    imageAlt: record.imageAlt?.trim() || title,
    tags: normalizePocketBaseTags(record.tags).concat(['devlog']),
    body: resolvedBody
  };
};

const parseRssItems = (xml: string): ExternalNewsItem[] => {
  const itemMatches = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)];
  const entryMatches = itemMatches.length > 0 ? itemMatches : [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)];

  return entryMatches.slice(0, EXTERNAL_MAX_ITEMS).flatMap((match, index) => {
    const block = match[0];
    const title = stripHtml(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
    const description = stripHtml(block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ?? '');
    const pubDate =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ??
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1]?.trim() ??
      block.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1]?.trim();
    const link =
      stripHtml(block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? '') ||
      block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ||
      block.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i)?.[1] ||
      '';
    const guid = stripHtml(block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1] ?? link);
    const image = block.match(/<enclosure[^>]*url="([^"]+)"/i)?.[1];
    const categories = [...block.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)]
      .map((category) => stripHtml(category[1]))
      .filter(Boolean);
    const resolvedTitle = title || `External story ${index + 1}`;
    const sourceUrl = link || guid || FEED_SOURCE_URL || '';

    if (!sourceUrl) {
      return [];
    }

    return [
      {
        category: 'scene',
        slug: slugify(resolvedTitle) || `scene-story-${index + 1}`,
        sourceKind: 'external',
        sourceName: FEED_SOURCE_NAME,
        sourceUrl,
        canonicalUrl: sourceUrl,
        title: resolvedTitle,
        description: description || resolvedTitle,
        excerpt: description || resolvedTitle,
        publishedTime: resolvePublishedTime(pubDate),
        image,
        imageAlt: resolvedTitle,
        tags: pickTagList(categories.join(','), ['scene', 'external'])
      }
    ];
  });
};

const getPocketBaseDevlogItems = async (): Promise<LocalNewsItem[]> => {
  if (cachedPocketBaseDevlogItemsPromise) {
    return cachedPocketBaseDevlogItemsPromise;
  }

  cachedPocketBaseDevlogItemsPromise = (async () => {
    const config = getPocketBaseConfig();
    if (!config) {
      return [];
    }

    const filter = import.meta.env.PUBLIC_POCKETBASE_DEVLOGS_FILTER?.trim();
    const perPage = 100;
    const maxPages = 10;
    const items: LocalNewsItem[] = [];

    for (let page = 1; page <= maxPages; page += 1) {
      const params = new URLSearchParams({
        sort: '-publishedTime',
        perPage: String(perPage),
        page: String(page)
      });

      if (filter) {
        params.set('filter', filter);
      }

      const url = `${config.baseUrl}/api/collections/${encodeURIComponent(config.collection)}/records?${params.toString()}`;

      try {
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) {
          return [];
        }

        const payload = await response.json();
        const records = Array.isArray(payload?.items) ? (payload.items as PocketBaseDevlogRecord[]) : [];

        for (const record of records) {
          items.push(mapPocketBaseDevlogRecord(record));
        }

        if (records.length < perPage) {
          break;
        }
      } catch {
        return [];
      }
    }

    return items;
  })();

  return cachedPocketBaseDevlogItemsPromise;
};

export const getAllNewsItems = async (): Promise<NewsItem[]> => {
  if (!cachedAllNewsItemsPromise) {
    cachedAllNewsItemsPromise = (async () => {
      const [externalItems, pocketBaseDevlogItems] = await Promise.all([
        getExternalSceneNewsItems(),
        getPocketBaseDevlogItems()
      ]);

      const localDevlogItems = LOCAL_NEWS.filter((item) => item.category === 'devlog');
      const localNonDevlogItems = LOCAL_NEWS.filter((item) => item.category !== 'devlog');
      const devlogItems = pocketBaseDevlogItems.length > 0 ? pocketBaseDevlogItems : localDevlogItems;

      return [...devlogItems, ...localNonDevlogItems, ...externalItems].sort(
        (left, right) => Date.parse(right.publishedTime) - Date.parse(left.publishedTime)
      );
    })();
  }

  return cachedAllNewsItemsPromise;
};

export const getNewsItemsByCategory = async (category: NewsCategory): Promise<NewsItem[]> => {
  const items = await getAllNewsItems();
  return items.filter((item) => item.category === category);
};

export const getNewsItemByCategoryAndSlug = async (category: NewsCategory, slug: string): Promise<NewsItem | undefined> => {
  const items = await getAllNewsItems();
  return items.find((item) => item.category === category && item.slug === slug);
};

export const getRecentNewsItems = async (limit = 6): Promise<NewsItem[]> => (await getAllNewsItems()).slice(0, limit);

const getExternalSceneNewsItems = async (): Promise<ExternalNewsItem[]> => {
  if (cachedExternalSceneItemsPromise) {
    return cachedExternalSceneItemsPromise;
  }

  cachedExternalSceneItemsPromise = (async () => {
    if (!FEED_URL) {
      return [];
    }

    try {
      const response = await fetch(FEED_URL);

      if (!response.ok) {
        return [];
      }

      const xml = await response.text();
      return parseRssItems(xml);
    } catch {
      return [];
    }
  })();

  return cachedExternalSceneItemsPromise;
};

export const getNewsCategoryMeta = (category: NewsCategory) => NEWS_CATEGORIES[category];

export const getNewsCategoryTitle = (category: NewsCategory) => NEWS_CATEGORIES[category].title;

export const getNewsCategoryDescription = (category: NewsCategory) => NEWS_CATEGORIES[category].description;

export const getNewsCategoryAccent = (category: NewsCategory) => NEWS_CATEGORIES[category].accent;

export const getNewsCategoryPath = (category: NewsCategory) => withBasePath(`/news/${category}`);

export const isNewsCategory = (value: string): value is NewsCategory =>
  value === 'devlog' || value === 'app' || value === 'scene';

export const isExternalNewsItem = (item: NewsItem): item is ExternalNewsItem => item.sourceKind === 'external';

export const isLocalNewsItem = (item: NewsItem): item is LocalNewsItem => item.sourceKind === 'local';
