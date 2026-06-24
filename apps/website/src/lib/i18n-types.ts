export type LocaleCode = 'en-US' | 'it-IT' | 'es-419' | 'pt-BR' | 'zh-Hans';
export type LocalePath = '' | 'it' | 'es' | 'pt-br' | 'zh';

export interface LocaleConfig {
  code: LocaleCode;
  path: LocalePath;
  hreflang: string;
  label: string;
  nativeLabel: string;
}

export interface AlternateLink {
  hreflang: string;
  href: string;
}

export interface CategoryCopy {
  label: string;
  title: string;
  description: string;
}

export interface SiteCopy {
  nav: {
    menu: string;
    play: string;
    manifesto: string;
    news: string;
    battle: string;
    board: string;
    devLab: string;
  };
  footer: {
    ready: string;
    manifesto: string;
    privacy: string;
    cookies: string;
    terms: string;
    openDevelopment: string;
    contact: string;
    openSource: string;
    participate: string;
    discord: string;
    github: string;
  };
  switcher: {
    label: string;
  };
  news: {
    eyebrow: string;
    title: string;
    intro: string;
    openArchive: string;
    enterArchive: string;
    latestDrops: string;
    devlogArchive: string;
    readMore: string;
    source: string;
    sceneNotes: string;
    backToArchive: string;
    openSource: string;
    story: string;
    metadata: string;
    category: string;
    author: string;
    published: string;
    updated: string;
    tags: string;
    categoryRules: string;
    rules: Record<'devlog' | 'app' | 'scene', string[]>;
    categories: Record<'devlog' | 'app' | 'scene', CategoryCopy>;
  };
}
