import { getBasePath, withBasePath } from './base';
import type {
  AlternateLink,
  CategoryCopy,
  LocaleCode,
  LocaleConfig,
  LocalePath,
  SiteCopy
} from './i18n-types';
import { SITE_COPY } from './i18n-data/site';

export type { AlternateLink, CategoryCopy, LocaleCode, LocaleConfig, LocalePath, SiteCopy };

export const LOCALES: Record<LocaleCode, LocaleConfig> = {
  'en-US': { code: 'en-US', path: '', hreflang: 'en-US', label: 'English (US)', nativeLabel: 'English' },
  'it-IT': { code: 'it-IT', path: 'it', hreflang: 'it-IT', label: 'Italian', nativeLabel: 'Italiano' },
  'es-419': { code: 'es-419', path: 'es', hreflang: 'es-419', label: 'Spanish (LatAm)', nativeLabel: 'Español' },
  'pt-BR': { code: 'pt-BR', path: 'pt-br', hreflang: 'pt-BR', label: 'Portuguese (BR)', nativeLabel: 'Português' },
  'zh-Hans': { code: 'zh-Hans', path: 'zh', hreflang: 'zh-Hans', label: 'Chinese (Simplified)', nativeLabel: '简体中文' }
};

const PATH_TO_CODE: Record<Exclude<LocalePath, ''>, LocaleCode> = {
  it: 'it-IT',
  es: 'es-419',
  'pt-br': 'pt-BR',
  zh: 'zh-Hans'
};

export const SUPPORTED_LOCALES = Object.keys(LOCALES) as LocaleCode[];

export const DEFAULT_LOCALE: LocaleCode = 'en-US';

export const getLocaleConfig = (locale: LocaleCode): LocaleConfig => LOCALES[locale];

export const getLocaleCodeFromPath = (path: string | undefined | null): LocaleCode => {
  if (!path) return DEFAULT_LOCALE;
  return PATH_TO_CODE[path as Exclude<LocalePath, ''>] ?? DEFAULT_LOCALE;
};

export const getLocalePath = (locale: LocaleCode): LocalePath => LOCALES[locale].path;

export const buildLocalizedPath = (locale: LocaleCode, pathname = '/'): string => {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const base = getLocalePath(locale);

  if (!base) {
    return withBasePath(normalized === '/' ? '/' : normalized.replace(/\/+$/, ''));
  }

  return withBasePath(normalized === '/' ? `/${base}` : `/${base}${normalized}`.replace(/\/+$/, ''));
};

export const buildLocalizedAlternates = (pathname = '/'): AlternateLink[] =>
  SUPPORTED_LOCALES.map((locale) => ({
    hreflang: LOCALES[locale].hreflang,
    href: buildLocalizedPath(locale, pathname)
  }));

export const stripLocalePrefix = (pathname: string): string => {
  const basePath = getBasePath();
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const basePrefix = basePath === '/' ? '' : basePath.slice(0, -1);
  const withoutBase =
    basePrefix && normalized.startsWith(basePrefix)
      ? normalized === basePrefix
        ? '/'
        : normalized.slice(basePrefix.length)
      : normalized;
  const segments = withoutBase.split('/').filter(Boolean);
  const first = segments[0] as Exclude<LocalePath, ''> | undefined;

  if (first && PATH_TO_CODE[first]) {
    const remainder = `/${segments.slice(1).join('/')}`.replace(/\/+$/, '');
    return remainder === '/' || remainder === '' ? '/' : remainder;
  }

  return withoutBase === '' ? '/' : withoutBase;
};

export const getSiteCopy = (locale: LocaleCode): SiteCopy => SITE_COPY[locale];

export const getLocaleSwitcherLinks = (currentPath: string) =>
  SUPPORTED_LOCALES.map((locale) => ({
    locale,
    label: LOCALES[locale].nativeLabel,
    path: buildLocalizedPath(locale, currentPath)
  }));
