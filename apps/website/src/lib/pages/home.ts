import type { LocaleCode } from '../i18n';

export interface HomeDevlogCard {
  label: string;
  title: string;
  excerpt: string;
  cta: string;
}

export interface HomeCopy {
  seoTitle: string;
  seoDescription: string;
  heroLabel: string;
  heroTitle: string;
  heroLead: string;
  devlogsTitle: string;
  devlogsLead: string;
  manifestoLabel: string;
  manifestoTitle: string;
  manifestoDescription: string;
  manifestoCta: string;
  manifestoSecondaryCta: string;
  discordLabel: string;
  discordTitle: string;
  discordDescription: string;
  discordCta: string;
  instagramLabel: string;
  instagramTitle: string;
  instagramDescription: string;
  instagramCta: string;
  githubLabel: string;
  githubTitle: string;
  githubDescription: string;
  githubCta: string;
  newsletterLabel: string;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterCta: string;
  archiveCta: string;
  devlogCardCta: string;
  emptyDevlogs: string;
}

export const HOME_COPY: Record<LocaleCode, HomeCopy> = {
  'en-US': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      'BboyArena.org is an independent, community-driven project about breaking culture, creative movement, and experimental game development, built with open development and privacy-friendly design.',
    heroLabel: 'Bboying or DIE!',
    heroTitle: 'FROM THE CYPHER TO THE BROWSER. A COMMUNITY PROJECT GAME FOR BREAKING CULTURE.',
    heroLead:
      'BBoyArena is not just a game page. It is a place to keep the spirit of breaking alive: the practice, the style, the battles, the injuries, the obsession, the music, and the people who never really stopped being part of the culture.',
    devlogsTitle: 'Latest devlogs',
    devlogsLead: 'The most recent build notes from the project, kept public and easy to scan.',
    manifestoLabel: 'Manifesto',
    manifestoTitle: 'Scopes',
    manifestoDescription:
      'This is a statement about a browser game built from real breaking culture, not from distance. I lived this culture, I still respect it, and I want the project to carry that truth forward.',
    manifestoCta: 'Open manifesto',
    manifestoSecondaryCta: 'Read the full manifesto',
    discordLabel: 'Discord',
    discordTitle: 'Join the community chat',
    discordDescription: 'Share feedback, follow progress, and talk with the crew while the project keeps evolving.',
    discordCta: 'Open Discord',
    instagramLabel: 'Instagram',
    instagramTitle: 'Follow the visual feed',
    instagramDescription: 'See artwork, screenshots, short updates, and the visual language that keeps the project in motion.',
    instagramCta: 'Open Instagram',
    githubLabel: 'GitHub',
    githubTitle: 'Browse the source',
    githubDescription: 'Check the codebase, track changes, and follow the open development side of the project.',
    githubCta: 'Open GitHub',
    newsletterLabel: 'Account',
    newsletterTitle: 'Create your player profile',
    newsletterDescription: 'Register your BboyArena ID and get ready for profiles, scores, replays, and community features.',
    newsletterCta: 'Create account',
    archiveCta: 'View devlog archive',
    devlogCardCta: 'Read devlog',
    emptyDevlogs: 'No devlogs published yet.'
  },
  'it-IT': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      'BboyArena.org è un progetto indipendente e community-driven dedicato alla cultura breaking, al movimento creativo e allo sviluppo sperimentale, con open development e design privacy-friendly.',
    heroLabel: 'Lancio pubblico',
    heroTitle: 'DALLA STRADA AL WEB. UN PROGETTO COMUNITARIO PER LA CULTURA BREAKING.',
    heroLead:
      'BBoyArena non è solo una pagina di gioco. È un luogo per mantenere vivo lo spirito del breaking: la pratica, lo stile, le battle, gli infortuni, l\'ossessione, la musica e le persone che non hanno mai smesso di far parte della cultura. Un modo per dire grazie negli anni in cui mi ha salvato.',
    devlogsTitle: 'Ultimi devlog',
    devlogsLead: 'Gli appunti più recenti del progetto, pubblici e facili da leggere.',
    manifestoLabel: 'Manifesto',
    manifestoTitle: 'Motivazioni',
    manifestoDescription:
      'Questo è browser game (open source) costruito dalla cultura breaking. Ho vissuto il Breaking in prima persona dagli anni \'90, la rispetto ancora oggi e voglio che il progetto sia un tributo a questa cultura, portandone avanti la verità.',
    manifestoCta: 'Manifesto',
    manifestoSecondaryCta: 'Leggi il manifesto completo',
    discordLabel: 'Discord',
    discordTitle: 'Discuti e Proponi',
    discordDescription: 'Condividi feedback, segui i progressi e parla con la crew mentre il progetto continua a evolversi.',
    discordCta: 'Apri Discord',
    instagramLabel: 'Instagram',
    instagramTitle: 'Segui il flow',
    instagramDescription: 'Vedi artwork, screenshot, aggiornamenti brevi e il linguaggio visivo che tiene il progetto in movimento.',
    instagramCta: 'Apri Instagram',
    githubLabel: 'GitHub',
    githubTitle: 'Open Source',
    githubDescription: 'Controlla il codice, segui i cambiamenti e il lato open development del progetto.',
    githubCta: 'Apri GitHub',
    newsletterLabel: 'Account',
    newsletterTitle: 'Crea il tuo profilo player',
    newsletterDescription: 'Registra il tuo BboyArena ID e preparati a profili, punteggi, replay e funzioni community.',
    newsletterCta: 'Crea account',
    archiveCta: 'Vedi archivio devlog',
    devlogCardCta: 'Leggi devlog',
    emptyDevlogs: 'Nessun devlog pubblicato ancora.'
  },
  'es-419': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      'BboyArena.org es un proyecto independiente y guiado por la comunidad sobre cultura breaking, movimiento creativo y desarrollo experimental, con open development y un diseño respetuoso con la privacidad.',
    heroLabel: 'Lanzamiento público',
    heroTitle: 'Una superficie pública pequeña, un proyecto que sigue moviéndose detrás.',
    heroLead:
      'Esta es la base de lanzamiento: una página simple para seguir el trabajo, leer el manifiesto y ver los últimos devlogs sin exponer funciones incompletas.',
    devlogsTitle: 'Últimos devlogs',
    devlogsLead: 'Las notas más recientes del proyecto, públicas y fáciles de escanear.',
    manifestoLabel: 'Manifiesto',
    manifestoTitle: 'Why / Perché',
    manifestoDescription:
      'Esta es una declaración sobre un juego de navegador construido desde la cultura breaking real, no desde la distancia. Viví esta cultura, sigo respetándola y quiero que el proyecto lleve esa verdad hacia adelante.',
    manifestoCta: 'Abrir manifiesto',
    manifestoSecondaryCta: 'Leer el manifiesto completo',
    discordLabel: 'Discord',
    discordTitle: 'Entra al chat de la comunidad',
    discordDescription: 'Comparte comentarios, sigue el avance y habla con la crew mientras el proyecto sigue creciendo.',
    discordCta: 'Abrir Discord',
    instagramLabel: 'Instagram',
    instagramTitle: 'Sigue el feed visual',
    instagramDescription: 'Mira arte, capturas, actualizaciones breves y el lenguaje visual que mantiene vivo el proyecto.',
    instagramCta: 'Abrir Instagram',
    githubLabel: 'GitHub',
    githubTitle: 'Explora el código',
    githubDescription: 'Revisa la base de código, sigue los cambios y la parte de open development del proyecto.',
    githubCta: 'Abrir GitHub',
    newsletterLabel: 'Cuenta',
    newsletterTitle: 'Crea tu perfil de player',
    newsletterDescription: 'Registra tu BboyArena ID y prepárate para perfiles, puntuaciones, replays y funciones de comunidad.',
    newsletterCta: 'Crear cuenta',
    archiveCta: 'Ver archivo devlog',
    devlogCardCta: 'Leer devlog',
    emptyDevlogs: 'Todavía no hay devlogs publicados.'
  },
  'pt-BR': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      'BboyArena.org é um projeto independente e guiado pela comunidade sobre cultura breaking, movimento criativo e desenvolvimento experimental, com open development e design privacy-friendly.',
    heroLabel: 'Lançamento público',
    heroTitle: 'Uma superfície pública pequena, um projeto que continua se movendo por trás.',
    heroLead:
      'Esta é a base de lançamento: uma página simples para acompanhar o trabalho, ler o manifesto e acessar os últimos devlogs sem expor recursos inacabados.',
    devlogsTitle: 'Últimos devlogs',
    devlogsLead: 'As notas mais recentes do projeto, públicas e fáceis de escanear.',
    manifestoLabel: 'Manifesto',
    manifestoTitle: 'Why / Perché',
    manifestoDescription:
      'Esta é uma declaração sobre um jogo de navegador construído a partir da cultura breaking real, não de longe. Eu vivi essa cultura, continuo respeitando-a e quero que o projeto carregue essa verdade adiante.',
    manifestoCta: 'Abrir manifesto',
    manifestoSecondaryCta: 'Ler o manifesto completo',
    discordLabel: 'Discord',
    discordTitle: 'Entre no chat da comunidade',
    discordDescription: 'Compartilhe feedback, acompanhe o progresso e fale com a crew enquanto o projeto continua evoluindo.',
    discordCta: 'Abrir Discord',
    instagramLabel: 'Instagram',
    instagramTitle: 'Acompanhe o feed visual',
    instagramDescription: 'Veja artes, capturas, atualizações curtas e a linguagem visual que mantém o projeto em movimento.',
    instagramCta: 'Abrir Instagram',
    githubLabel: 'GitHub',
    githubTitle: 'Navegue pelo código',
    githubDescription: 'Confira a base de código, acompanhe as mudanças e o lado open development do projeto.',
    githubCta: 'Abrir GitHub',
    newsletterLabel: 'Conta',
    newsletterTitle: 'Crie seu perfil de player',
    newsletterDescription: 'Registre seu BboyArena ID e prepare-se para perfis, pontuações, replays e recursos de comunidade.',
    newsletterCta: 'Criar conta',
    archiveCta: 'Ver arquivo devlog',
    devlogCardCta: 'Ler devlog',
    emptyDevlogs: 'Ainda não há devlogs publicados.'
  },
  'zh-Hans': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      'BboyArena.org 是一个独立、由社区驱动的项目，围绕 breaking 文化、创意动作与实验性游戏开发展开，并采用开放开发与隐私友好设计。',
    heroLabel: '公开上线',
    heroTitle: '前台很小，后台的项目仍在持续推进。',
    heroLead:
      '这是上线基础页：一个简单的页面，用来关注项目进度、阅读宣言，并查看最新开发日志，而不会暴露未完成的功能。',
    devlogsTitle: '最新开发日志',
    devlogsLead: '项目最近的构建记录，保持公开且便于快速浏览。',
    manifestoLabel: '宣言',
    manifestoTitle: 'Why / Perché',
    manifestoDescription:
      '这是一份关于浏览器游戏的声明，它来自真实的 breaking 文化，而不是远距离的想象。我真正经历过这份文化，如今依然尊重它，也希望项目能继续传递这份真实。',
    manifestoCta: '打开宣言',
    manifestoSecondaryCta: '阅读完整宣言',
    discordLabel: 'Discord',
    discordTitle: '加入社区聊天',
    discordDescription: '分享反馈、关注进展，并在项目持续推进时与团队交流。',
    discordCta: '打开 Discord',
    instagramLabel: 'Instagram',
    instagramTitle: '关注视觉动态',
    instagramDescription: '查看插画、截图、简短更新，以及推动项目继续前进的视觉语言。',
    instagramCta: '打开 Instagram',
    githubLabel: 'GitHub',
    githubTitle: '浏览源码',
    githubDescription: '查看代码库、跟踪变更，并关注项目的开放开发部分。',
    githubCta: '打开 GitHub',
    newsletterLabel: '账号',
    newsletterTitle: '创建你的玩家档案',
    newsletterDescription: '注册你的 BboyArena ID，为个人资料、分数、回放和社区功能做好准备。',
    newsletterCta: '创建账号',
    archiveCta: '查看开发日志档案',
    devlogCardCta: '阅读日志',
    emptyDevlogs: '目前还没有发布开发日志。'
  }
};

export const getHomeCopy = (locale: LocaleCode) => HOME_COPY[locale];
