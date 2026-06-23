import type { LocaleCode, SiteCopy } from '../../i18n-types';

export const NAV_COPY: Record<LocaleCode, SiteCopy['nav']> = {
  'en-US': {
    menu: 'Menu',
    manifesto: 'Manifesto',
    news: 'News',
    battle: 'Battle',
    board: 'Board',
    devLab: 'Dev Lab'
  },
  'it-IT': {
    menu: 'Menu',
    manifesto: 'Manifesto',
    news: 'News',
    battle: 'Battaglia',
    board: 'Classifica',
    devLab: 'Dev Lab'
  },
  'es-419': {
    menu: 'Menú',
    manifesto: 'Manifiesto',
    news: 'Noticias',
    battle: 'Batalla',
    board: 'Tabla',
    devLab: 'Dev Lab'
  },
  'pt-BR': {
    menu: 'Menu',
    manifesto: 'Manifesto',
    news: 'Notícias',
    battle: 'Batalha',
    board: 'Ranking',
    devLab: 'Dev Lab'
  },
  'zh-Hans': {
    menu: '菜单',
    manifesto: '宣言',
    news: '新闻',
    battle: '对战',
    board: '榜单',
    devLab: '开发实验室'
  }
};

export const FOOTER_COPY: Record<LocaleCode, SiteCopy['footer']> = {
  'en-US': {
    ready: 'PWA ready',
    manifesto: 'Manifesto',
    privacy: 'Privacy',
    cookies: 'Cookies',
    terms: 'Terms',
    openDevelopment: 'Open Development',
    contact: 'Contact',
    openSource: 'Open Source',
    participate: 'Participate',
    discord: 'Discord',
    github: 'GitHub'
  },
  'it-IT': {
    ready: 'PWA pronta',
    manifesto: 'Manifesto',
    privacy: 'Privacy',
    cookies: 'Cookie',
    terms: 'Termini',
    openDevelopment: 'Sviluppo aperto',
    contact: 'Contatto',
    openSource: 'Open Source',
    participate: 'Partecipa',
    discord: 'Discord',
    github: 'GitHub'
  },
  'es-419': {
    ready: 'PWA lista',
    manifesto: 'Manifiesto',
    privacy: 'Privacidad',
    cookies: 'Cookies',
    terms: 'Términos',
    openDevelopment: 'Desarrollo abierto',
    contact: 'Contacto',
    openSource: 'Open source',
    participate: 'Participar',
    discord: 'Discord',
    github: 'GitHub'
  },
  'pt-BR': {
    ready: 'PWA pronta',
    manifesto: 'Manifesto',
    privacy: 'Privacidade',
    cookies: 'Cookies',
    terms: 'Termos',
    openDevelopment: 'Desenvolvimento aberto',
    contact: 'Contato',
    openSource: 'Open Source',
    participate: 'Participar',
    discord: 'Discord',
    github: 'GitHub'
  },
  'zh-Hans': {
    ready: 'PWA 就绪',
    manifesto: '宣言',
    privacy: '隐私',
    cookies: 'Cookie',
    terms: '条款',
    openDevelopment: '开放开发',
    contact: '联系',
    openSource: '开源',
    participate: '参与',
    discord: 'Discord',
    github: 'GitHub'
  }
};

export const SWITCHER_COPY: Record<LocaleCode, SiteCopy['switcher']> = {
  'en-US': { label: 'Language' },
  'it-IT': { label: 'Lingua' },
  'es-419': { label: 'Idioma' },
  'pt-BR': { label: 'Idioma' },
  'zh-Hans': { label: '语言' }
};
