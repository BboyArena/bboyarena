import { withBasePath } from './base';

export type SeoPageType = 'website' | 'article';
export type SeoTwitterCard = 'summary' | 'summary_large_image';

export interface SeoInput {
  siteUrl?: URL;
  currentUrl: URL;
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  siteName: string;
  locale: string;
  type?: SeoPageType;
  image?: string;
  imageAlt?: string;
  logo?: string;
  twitterCard?: SeoTwitterCard;
  twitterSite?: string;
  twitterCreator?: string;
  author?: string;
  sameAs?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface SeoResolved {
  canonicalUrl: string;
  imageUrl?: string;
  logoUrl?: string;
  robotsContent: string;
  jsonLd: Record<string, unknown>;
}

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export const resolveUrl = (value: string | undefined, siteUrl: URL | undefined, fallbackBase: URL) => {
  if (!value) return undefined;

  try {
    if (isAbsoluteUrl(value)) {
      return new URL(value).href;
    }

    const resolvedValue = value.startsWith('/') ? withBasePath(value) : value;
    return new URL(resolvedValue, siteUrl ?? fallbackBase).href;
  } catch {
    return value;
  }
};

export const buildSeoData = (input: SeoInput): SeoResolved => {
  const {
    siteUrl,
    currentUrl,
    title,
    description,
    canonical,
    noindex = false,
    siteName,
    locale,
    type = 'website',
    image,
    imageAlt,
    logo,
    author,
    sameAs = [],
    publishedTime,
    modifiedTime,
    section,
    tags = []
  } = input;

  const canonicalUrl = resolveUrl(canonical ?? currentUrl.pathname, siteUrl, currentUrl) ?? currentUrl.href;
  const imageUrl = resolveUrl(image, siteUrl, currentUrl);
  const logoUrl = resolveUrl(logo, siteUrl, currentUrl);
  const robotsContent = noindex
    ? 'noindex,nofollow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

  const jsonLd =
    type === 'article'
      ? {
          '@context': 'https://schema.org',
          '@type': publishedTime ? 'NewsArticle' : 'Article',
          headline: title,
          description,
          image: imageUrl ? [imageUrl] : undefined,
          author: author ? { '@type': 'Person', name: author } : undefined,
          publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: logoUrl ? { '@type': 'ImageObject', url: logoUrl } : undefined,
            sameAs: sameAs.length > 0 ? sameAs : undefined
          },
          datePublished: publishedTime,
          dateModified: modifiedTime ?? publishedTime,
          articleSection: section,
          keywords: tags.length > 0 ? tags.join(', ') : undefined,
          mainEntityOfPage: canonicalUrl
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description,
          url: canonicalUrl,
          inLanguage: locale,
          publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: logoUrl ? { '@type': 'ImageObject', url: logoUrl } : undefined,
            sameAs: sameAs.length > 0 ? sameAs : undefined
          },
          sameAs: sameAs.length > 0 ? sameAs : undefined
        };

  return {
    canonicalUrl,
    imageUrl,
    logoUrl,
    robotsContent,
    jsonLd
  };
};
