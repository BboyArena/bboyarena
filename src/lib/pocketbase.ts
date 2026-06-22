import { DEFAULT_LOCALE, getLocaleCodeFromPath, type LocaleCode } from './i18n';
import { getBasePath } from './base';

export interface PocketBaseConfig {
  baseUrl: string;
  collection: string;
}

export interface PocketBaseDevlogRecord {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  excerpt?: string;
  body?: string[] | string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  image?: string;
  imageAlt?: string;
  tags?: string[] | string;
}

export interface ResolvedPocketBaseDevlogPath {
  locale: LocaleCode;
  slug: string;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const stripBasePath = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const basePath = getBasePath();

  if (basePath === '/') {
    return normalized;
  }

  const basePrefix = basePath.slice(0, -1);

  if (normalized === basePrefix) {
    return '/';
  }

  if (normalized.startsWith(`${basePrefix}/`)) {
    return normalized.slice(basePrefix.length) || '/';
  }

  return normalized;
};

export const getPocketBaseConfig = (): PocketBaseConfig | null => {
  const baseUrl = import.meta.env.PUBLIC_POCKETBASE_URL?.trim();
  if (!baseUrl) return null;

  return {
    baseUrl: trimTrailingSlash(baseUrl),
    collection: import.meta.env.PUBLIC_POCKETBASE_DEVLOGS_COLLECTION?.trim() || 'devlogs'
  };
};

export const buildPocketBaseDevlogListUrl = (limit = 3): string | null => {
  const config = getPocketBaseConfig();
  if (!config) return null;

  const filter = import.meta.env.PUBLIC_POCKETBASE_DEVLOGS_FILTER?.trim();
  const params = new URLSearchParams({
    sort: '-publishedTime',
    perPage: String(limit)
  });

  if (filter) {
    params.set('filter', filter);
  }

  return `${config.baseUrl}/api/collections/${encodeURIComponent(config.collection)}/records?${params.toString()}`;
};

export const buildPocketBaseDevlogRecordUrl = (slug: string): string | null => {
  const config = getPocketBaseConfig();
  if (!config) return null;

  const escapedSlug = slug.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const filter = import.meta.env.PUBLIC_POCKETBASE_DEVLOGS_FILTER?.trim();
  const params = new URLSearchParams({
    filter: `slug = "${escapedSlug}"`
  });

  if (filter) {
    params.set('filter', `${filter} && slug = "${escapedSlug}"`);
  }

  return `${config.baseUrl}/api/collections/${encodeURIComponent(config.collection)}/records?${params.toString()}`;
};

export const resolvePocketBaseDevlogPath = (pathname: string): ResolvedPocketBaseDevlogPath | null => {
  const pathWithoutBase = stripBasePath(pathname);
  const segments = pathWithoutBase.split('/').filter(Boolean);
  const localeCandidate = segments[0];
  const locale = getLocaleCodeFromPath(localeCandidate);
  const hasLocalePrefix = locale !== DEFAULT_LOCALE && localeCandidate !== undefined;
  const routeSegments = hasLocalePrefix ? segments.slice(1) : segments;
  const routePath = `/${routeSegments.join('/')}`.replace(/\/+$/, '');
  const match = routePath.match(/^\/news\/devlog\/([^/]+)$/i);

  if (!match) {
    return null;
  }

  return {
    locale,
    slug: decodeURIComponent(match[1])
  };
};

export const normalizePocketBaseTags = (tags?: string[] | string): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  return String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};
