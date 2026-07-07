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
    slug: 'from-pressing-buttons-to-building-a-round',
    sourceKind: 'local',
    title: 'From Pressing Buttons to Building a Round',
    description:
      'BboyArena now has its first playable movement flow: moves follow the beat, combinations can be planned ahead, and touch controls are becoming easier to trust.',
    excerpt:
      'The latest prototype is less about triggering isolated animations and more about an essential part of breaking: choosing what comes next and giving each move room to land.',
    publishedTime: '2026-07-07T10:00:00+02:00',
    modifiedTime: '2026-07-07T10:00:00+02:00',
    author: 'BboyArena',
    image: '/readme-banner.png',
    imageAlt: 'BboyArena first gameplay prototype development log',
    tags: ['devlog', 'gameplay', 'rhythm', 'movement', 'touch-controls', 'prototype'],
    body: `For a long time, BboyArena could recognize an input, choose a movement and show useful information on screen. Those were important foundations, but they did not yet feel like playing.

The latest prototype changes that.

You can now choose between toprock, footwork, freezes and powermoves. A move starts, follows a set number of beats and makes room for the next choice. If you enter another move while the current one is still playing, it waits in a queue instead of interrupting everything immediately.

It is a small change with a big effect: the player is no longer pressing buttons only to see isolated reactions. They are beginning to build a sequence.

That distinction matters in breaking. A round is not a bag of moves thrown onto the floor. Timing, transitions and intention connect the vocabulary. Even a powerful move can feel misplaced if it arrives without preparation or ignores the music.

The problem was that our earlier experiments treated input too directly. Press a control, trigger a response. That was useful for testing, but it gave every action the same urgency. There was no space for anticipation and very little sense of flow.

So the new experiment gives moves time. Each one has a duration measured against the beat, while a visible counter helps show where the music is. The interface also displays the active move, its progress and what is coming next. These are still development tools rather than a finished game interface, but they make the emerging rules much easier to understand.

We are also exploring directional paths for different movement families. Toprock can ask for a back-and-forth direction, footwork can trace a wider change of weight, a freeze can focus on holding balance, and a powermove can suggest circular control. For now, these paths are prototypes shown through diagnostic graphics. They are not a claim that breaking can be reduced to drawing shapes with a stick.

In fact, the experiment is teaching us the opposite.

The same path can produce very different movement depending on timing, body position and what came before it. The controls need enough structure to be readable, but enough freedom to leave space for style. Finding that balance will take many iterations.

Touch controls were another part of this work. The virtual joystick has been revised so it responds more clearly across phones and touch-capable devices. It is improving, but it still needs real testing on different screens and in different hands. A control that feels comfortable on one device can feel vague or oversized on another.

The result is the first version of BboyArena that begins to answer a gameplay question instead of only a technical one:

> How can a player think one move ahead while staying connected to the beat?

The answer is not complete. The current moves are synthetic prototypes, the visual feedback is deliberately diagnostic, and final animation quality is still ahead of us. Replay recording is also not finished, even though the rhythm foundation needed for it is now taking shape.

But there is finally a loop we can touch, question and improve. Choose a move. Feel its duration. Prepare the next one. Watch a short sequence become the beginning of a round.

Next, the work is to test whether these controls feel natural rather than merely understandable. That means refining transitions, trying the prototype across keyboard, gamepad and touch, and learning where structure helps flow—and where it gets in the way.`
  },
  {
    category: 'devlog',
    slug: 'a-windmill-is-not-just-a-spin',
    sourceKind: 'local',
    title: 'A Windmill Is Not Just a Spin',
    description:
      'A weekend spent studying the windmill revealed why powermoves need more than pose playback: they need a clear center, contact, tilt, rhythm, and flow.',
    excerpt:
      'What began as a Blender animation fix became a lesson about rotation, floor contact, and the movement system BboyArena needs for authentic powermoves.',
    publishedTime: '2026-06-30T10:00:00+02:00',
    modifiedTime: '2026-06-30T10:00:00+02:00',
    author: 'BboyArena',
    image: '/readme-banner.png',
    imageAlt: 'BboyArena windmill animation development log',
    tags: ['devlog', 'windmill', 'animation', 'blender', 'powermoves', 'three-js'],
    body: `Before working on the windmill animation, I wanted to go back to where the move comes from.

The windmill is usually traced back to Crazy Legs of Rock Steady Crew.
The story is not that somebody designed it like a perfect technique on paper. It came from experimentation: from the backspin, from trying to hit a chair freeze, from over-rotating, and from discovering that the mistake could become a continuous movement.

That is beautiful to me.

Because this weekend, while working on BboyArena, I felt something similar in a very small way.

At first, I thought I was only fixing an animation problem.

The windmill looked almost right.
The numbers in Blender were almost right.
The character was rotating almost one full turn.

But visually, something was wrong.

The movement did not feel clean.

After many tests, I understood the real issue:

> A windmill is not just a character spinning.

In breaking, the body is constantly changing its relationship with the floor.
The shoulder, the back, the hips, the legs, the center of rotation — everything matters.

A windmill has a center.
It has contact.
It has tilt.
It has rhythm.
It has flow.

Some of my poses looked good by themselves, but they were built around the wrong center of rotation. So when I tried to connect them into a full loop, the movement started to break.

That was the biggest lesson:

> A pose is not only a shape.
> A pose also depends on where the body is rotating from.

For a normal animation, this may be easy to hide.
For a powermove, it becomes obvious immediately.

I also found a hidden problem in my Blender setup: one control had an axis correction that made posing easier at first, but later made the full rotation harder to trust.

So the next step is not to create more poses.

The next step is to simplify.

I want to build a small clean test with:

* a simple dummy character;
* a clear spin center;
* a few windmill poses;
* visible floor contact points;
* a smooth loop;
* and a movement system that can later be translated into Three.js.

This weekend was not just about fixing a Blender file.

It was about understanding that BboyArena cannot treat powermoves like generic animations.

Breaking is not just pose playback.

A windmill came from rotation, contact, accident, control and style.

That is exactly the kind of feeling I want to capture in the game.`
  },
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
