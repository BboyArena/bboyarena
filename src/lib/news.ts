import { withBasePath } from './base';

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
  body: string[];
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

export const getAllNewsItems = async (): Promise<NewsItem[]> => {
  const externalItems = await getExternalSceneNewsItems();

  return [...LOCAL_NEWS, ...externalItems].sort(
    (left, right) => Date.parse(right.publishedTime) - Date.parse(left.publishedTime)
  );
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
