import type { LocaleCode, SiteCopy } from '../../i18n-types';
import { NAV_COPY, FOOTER_COPY, SWITCHER_COPY } from './shared';
import { NEWS_COPY } from './news';
import { GAME_COPY } from './game';

export const SITE_COPY: Record<LocaleCode, SiteCopy> = {
  'en-US': {
    nav: NAV_COPY['en-US'],
    footer: FOOTER_COPY['en-US'],
    switcher: SWITCHER_COPY['en-US'],
    news: NEWS_COPY['en-US'],
    game: GAME_COPY['en-US']
  },
  'it-IT': {
    nav: NAV_COPY['it-IT'],
    footer: FOOTER_COPY['it-IT'],
    switcher: SWITCHER_COPY['it-IT'],
    news: NEWS_COPY['it-IT'],
    game: GAME_COPY['it-IT']
  },
  'es-419': {
    nav: NAV_COPY['es-419'],
    footer: FOOTER_COPY['es-419'],
    switcher: SWITCHER_COPY['es-419'],
    news: NEWS_COPY['es-419'],
    game: GAME_COPY['es-419']
  },
  'pt-BR': {
    nav: NAV_COPY['pt-BR'],
    footer: FOOTER_COPY['pt-BR'],
    switcher: SWITCHER_COPY['pt-BR'],
    news: NEWS_COPY['pt-BR'],
    game: GAME_COPY['pt-BR']
  },
  'zh-Hans': {
    nav: NAV_COPY['zh-Hans'],
    footer: FOOTER_COPY['zh-Hans'],
    switcher: SWITCHER_COPY['zh-Hans'],
    news: NEWS_COPY['zh-Hans'],
    game: GAME_COPY['zh-Hans']
  }
};
