import { buildLocalizedPath, type LocaleCode, SUPPORTED_LOCALES } from '../i18n';

export interface ManifestoCardCopy {
  label: string;
  title: string;
  description: string;
  cta: string;
  href: 'community' | 'sponsor';
}

export interface ManifestoCopy {
  seoTitle: string;
  seoDescription: string;
  heroLabel: string;
  heroTitle: string;
  heroLead: string;
  followCta: string;
  communityCta: string;
  readCta: string;
  manifesto: string[];
  isTitle: string;
  isItems: string[];
  isNotTitle: string;
  isNotItems: string[];
  closingTitle: string;
  closing: string[];
  cards: [ManifestoCardCopy, ManifestoCardCopy];
  sponsorSubject: string;
}

export const MANIFESTO_PATH = '/manifesto';

export const getManifestoAlternates = () =>
  SUPPORTED_LOCALES.map((locale) => ({
    hreflang: locale,
    href: buildLocalizedPath(locale, MANIFESTO_PATH)
  }));

export const getManifestoSwitcherLinks = () =>
  SUPPORTED_LOCALES.map((locale) => ({
    locale,
    label:
      locale === 'en-US'
        ? 'English'
        : locale === 'it-IT'
          ? 'Italiano'
          : locale === 'es-419'
            ? 'Español'
            : locale === 'pt-BR'
              ? 'Português'
              : '简体中文',
    path: buildLocalizedPath(locale, MANIFESTO_PATH)
  }));

export const MANIFESTO_COPY: Record<LocaleCode, ManifestoCopy> = {
  'en-US': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      'An independent, community-driven project dedicated to breaking culture, creative movement, and experimental game development, with open development, respect for the scene, and privacy-friendly analytics.',
    heroLabel: 'Manifesto',
    heroTitle: 'Breaking has no age.',
    heroLead:
      'This is a statement about a browser game built from real breaking culture, not from distance. I lived this culture, I still respect it, and I want the project to carry that truth forward.',
    followCta: 'Follow the project',
    communityCta: 'Join the community',
    readCta: 'Read the manifesto',
    manifesto: [
      'I am building this game because I love breaking. That love is personal, lived, and long-standing. I was a b-boy. I danced for years. I still carry that history with me, and I still feel connected to the culture.',
      'I do not want to appropriate breaking. I do not want to pretend I own it. I want to build something that respects the people, the history, the energy of battle, and the emotional truth of the floor.',
      'Breaking has no age limit. I can call myself a retired b-boy and still remain part of the culture. The love does not expire, and the respect does not expire either.',
      'The goal is not to copy existing games or brands. The goal is to extend the spirit of older breaking games into something modern, multiplayer, social, and community-driven.',
      'This project is independent. It is inspired by breaking culture and by my own lived experience. It is not affiliated with any brand, league, or existing game.'
    ],
    isTitle: 'What this project is',
    isItems: [
      'Entertainment rooted in a real culture.',
      'A modern extension of older breaking game concepts.',
      'A space for memory, respect, and community.',
      'A game that treats battle as culture, performance, and dialogue.'
    ],
    isNotTitle: 'What this project is not',
    isNotItems: [
      'It is not an attempt to own breaking.',
      'It is not a cold clone of an existing brand or game.',
      "It is not nostalgia for nostalgia's sake.",
      'It is not a replacement for the culture. It is a tribute to it.'
    ],
    closingTitle: 'Closing note',
    closing: [
      'If you are a b-boy, a b-girl, or someone close to the culture, I hope you can feel the difference between appropriation and respect.',
      'This manifesto says one simple thing: the project is built with care, not claim, and with love, not distance.'
    ],
    cards: [
      {
        label: 'Community',
        title: 'Join the community',
        description: 'Follow the devlogs, read updates, and help shape the project through feedback and conversation.',
        cta: 'Open devlogs',
        href: 'community'
      },
      {
        label: 'Sponsor',
        title: 'Support the project',
        description: 'If you want to sponsor the project, reach out directly. No patron platform, just a direct conversation.',
        cta: 'Open sponsorship contact',
        href: 'sponsor'
      }
    ],
    sponsorSubject: 'Breakdance 3D sponsorship interest'
  },
  'it-IT': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      'Un progetto indipendente e community-driven dedicato alla cultura breaking, al movimento creativo e allo sviluppo sperimentale, con open development, rispetto per la scena e analytics privacy-friendly.',
    heroLabel: 'Manifesto',
    heroTitle: 'Il breaking non ha età.',
    heroLead:
      'Questo è uno statement su un videogioco browser costruito dalla cultura breaking vissuta davvero, non da distanza. Ho vissuto questa cultura, la rispetto ancora oggi e voglio che il progetto porti avanti quella verità.',
    followCta: 'Segui il progetto',
    communityCta: 'Entra nella community',
    readCta: 'Leggi il manifesto',
    manifesto: [
      'Sto costruendo questo gioco perché amo il breaking. È un amore personale, vissuto e duraturo. Sono stato un b-boy, ho ballato per anni e quella storia mi accompagna ancora oggi.',
      'Non voglio appropriarmi del breaking. Non voglio fingere di possederlo. Voglio costruire qualcosa che rispetti le persone, la storia, l’energia della battle e la verità emotiva del floor.',
      'Il breaking non ha età. Posso considerarmi un b-boy in pensione e restare comunque parte della cultura. L’amore non scade, e nemmeno il rispetto.',
      'L’obiettivo non è copiare giochi o brand esistenti. L’obiettivo è estendere lo spirito dei vecchi giochi di breaking in una forma moderna, multiplayer, sociale e community-driven.',
      'Questo progetto è indipendente. Nasce dalla cultura breaking e dal mio vissuto personale. Non è affiliato a brand, leghe o giochi esistenti.'
    ],
    isTitle: 'Cosa è questo progetto',
    isItems: [
      'Intrattenimento radicato in una cultura reale.',
      'Un’estensione moderna dei vecchi concept dei giochi di breaking.',
      'Uno spazio per memoria, rispetto e community.',
      'Un gioco che tratta la battle come cultura, performance e dialogo.'
    ],
    isNotTitle: 'Cosa non è questo progetto',
    isNotItems: [
      'Non è un tentativo di possedere il breaking.',
      'Non è un clone freddo di un brand o di un gioco esistente.',
      'Non è nostalgia fine a se stessa.',
      'Non è un sostituto della cultura. È un tributo alla cultura.'
    ],
    closingTitle: 'Chiusura',
    closing: [
      'Se sei un b-boy, una b-girl o qualcuno vicino alla cultura, spero tu possa sentire la differenza tra appropriazione e rispetto.',
      'Questo manifesto dice una cosa semplice: il progetto è costruito con cura, non con pretesa, e con amore, non con distanza.'
    ],
    cards: [
      {
        label: 'Community',
        title: 'Entra nella community',
        description: 'Segui i devlog, leggi gli aggiornamenti e aiuta il progetto con feedback e confronto.',
        cta: 'Apri devlog',
        href: 'community'
      },
      {
        label: 'Sponsor',
        title: 'Sostieni il progetto',
        description: 'Se vuoi sponsorizzare il progetto, scrivimi direttamente. Niente piattaforme tipo Patreon o Buy Me a Coffee, solo contatto diretto.',
        cta: 'Apri contatto sponsorship',
        href: 'sponsor'
      }
    ],
    sponsorSubject: 'Interest in Breakdance 3D sponsorship'
  },
  'es-419': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      'Un proyecto independiente y guiado por la comunidad dedicado a la cultura breaking, el movimiento creativo y el desarrollo experimental, con open development, respeto por la escena y analytics respetuosos con la privacidad.',
    heroLabel: 'Manifiesto',
    heroTitle: 'El breaking no tiene edad.',
    heroLead:
      'Esto es una declaración sobre un juego de navegador construido desde la cultura breaking real, no desde la distancia. Viví esta cultura, sigo respetándola y quiero que el proyecto lleve esa verdad hacia adelante.',
    followCta: 'Seguir el proyecto',
    communityCta: 'Entrar a la comunidad',
    readCta: 'Leer el manifiesto',
    manifesto: [
      'Estoy construyendo este juego porque amo el breaking. Ese amor es personal, vivido y duradero. Fui b-boy, bailé durante años y todavía llevo esa historia conmigo.',
      'No quiero apropiarme del breaking. No quiero fingir que lo poseo. Quiero construir algo que respete a la gente, la historia, la energía de la batalla y la verdad emocional del piso.',
      'El breaking no tiene límite de edad. Puedo considerarme un b-boy retirado y seguir siendo parte de la cultura. El amor no caduca, y el respeto tampoco.',
      'El objetivo no es copiar juegos o marcas existentes. El objetivo es extender el espíritu de los viejos juegos de breaking en una forma moderna, multijugador, social y guiada por la comunidad.',
      'Este proyecto es independiente. Nace de la cultura breaking y de mi propia experiencia vivida. No está afiliado a ninguna marca, liga o juego existente.'
    ],
    isTitle: 'Qué es este proyecto',
    isItems: [
      'Entretenimiento enraizado en una cultura real.',
      'Una extensión moderna de los antiguos conceptos de juegos de breaking.',
      'Un espacio para la memoria, el respeto y la comunidad.',
      'Un juego que trata la batalla como cultura, performance y diálogo.'
    ],
    isNotTitle: 'Qué no es este proyecto',
    isNotItems: [
      'No es un intento de poseer el breaking.',
      'No es una copia fría de una marca o juego existente.',
      'No es nostalgia por la nostalgia misma.',
      'No es un reemplazo de la cultura. Es un tributo a ella.'
    ],
    closingTitle: 'Nota final',
    closing: [
      'Si eres un b-boy, una b-girl o alguien cercano a la cultura, espero que puedas sentir la diferencia entre apropiación y respeto.',
      'Este manifiesto dice una sola cosa: el proyecto está construido con cuidado, no con reclamo, y con amor, no con distancia.'
    ],
    cards: [
      {
        label: 'Comunidad',
        title: 'Únete a la comunidad',
        description: 'Sigue los devlogs, lee las actualizaciones y ayuda al proyecto con feedback y conversación.',
        cta: 'Abrir devlogs',
        href: 'community'
      },
      {
        label: 'Patrocinio',
        title: 'Apoyar el proyecto',
        description: 'Si quieres patrocinar el proyecto, escríbeme directamente. Sin plataformas tipo Patreon o Buy Me a Coffee, solo contacto directo.',
        cta: 'Abrir contacto de patrocinio',
        href: 'sponsor'
      }
    ],
    sponsorSubject: 'Breakdance 3D sponsorship interest'
  },
  'pt-BR': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      'Um projeto independente e guiado pela comunidade dedicado à cultura breaking, ao movimento criativo e ao desenvolvimento experimental, com open development, respeito à cena e analytics privacy-friendly.',
    heroLabel: 'Manifesto',
    heroTitle: 'Breaking não tem idade.',
    heroLead:
      'Esta é uma declaração sobre um jogo de navegador construído a partir da cultura breaking real, não de longe. Eu vivi essa cultura, continuo respeitando-a e quero que o projeto carregue essa verdade adiante.',
    followCta: 'Seguir o projeto',
    communityCta: 'Entrar na comunidade',
    readCta: 'Ler o manifesto',
    manifesto: [
      'Estou construindo este jogo porque amo o breaking. Esse amor é pessoal, vivido e duradouro. Fui b-boy, dancei por anos e ainda carrego essa história comigo.',
      'Não quero me apropriar do breaking. Não quero fingir que sou dono dele. Quero construir algo que respeite as pessoas, a história, a energia da battle e a verdade emocional do chão.',
      'O breaking não tem limite de idade. Posso me considerar um b-boy aposentado e ainda fazer parte da cultura. O amor não expira, e o respeito também não.',
      'O objetivo não é copiar jogos ou marcas existentes. O objetivo é estender o espírito dos antigos jogos de breaking em uma forma moderna, multiplayer, social e guiada pela comunidade.',
      'Este projeto é independente. Nasce da cultura breaking e da minha própria experiência vivida. Não é afiliado a nenhuma marca, liga ou jogo existente.'
    ],
    isTitle: 'O que este projeto é',
    isItems: [
      'Entretenimento enraizado em uma cultura real.',
      'Uma extensão moderna dos antigos conceitos de jogos de breaking.',
      'Um espaço para memória, respeito e comunidade.',
      'Um jogo que trata a battle como cultura, performance e diálogo.'
    ],
    isNotTitle: 'O que este projeto não é',
    isNotItems: [
      'Não é uma tentativa de possuir o breaking.',
      'Não é um clone frio de uma marca ou jogo existente.',
      'Não é nostalgia pela nostalgia.',
      'Não é um substituto da cultura. É uma homenagem a ela.'
    ],
    closingTitle: 'Nota final',
    closing: [
      'Se você é um b-boy, uma b-girl ou alguém próximo da cultura, espero que consiga sentir a diferença entre apropriação e respeito.',
      'Este manifesto diz uma coisa simples: o projeto é construído com cuidado, não com pretensão, e com amor, não com distância.'
    ],
    cards: [
      {
        label: 'Comunidade',
        title: 'Entre na comunidade',
        description: 'Siga os devlogs, leia as atualizações e ajude o projeto com feedback e conversa.',
        cta: 'Abrir devlogs',
        href: 'community'
      },
      {
        label: 'Patrocínio',
        title: 'Apoiar o projeto',
        description: 'Se quiser patrocinar o projeto, fale comigo diretamente. Nada de plataformas como Patreon ou Buy Me a Coffee, só contato direto.',
        cta: 'Abrir contato de patrocínio',
        href: 'sponsor'
      }
    ],
    sponsorSubject: 'Breakdance 3D sponsorship interest'
  },
  'zh-Hans': {
    seoTitle: 'BboyArena.org',
    seoDescription:
      '一个独立、由社区驱动的项目，围绕 breaking 文化、创意动作与实验性游戏开发展开，并采用开放开发、尊重现场文化与隐私友好的分析方式。',
    heroLabel: '宣言',
    heroTitle: 'Breaking 没有年龄。',
    heroLead:
      '这是一份关于浏览器游戏的声明，它来自真实的 breaking 文化，而不是远距离的想象。我真正经历过这份文化，如今依然尊重它，也希望项目能继续传递这份真实。',
    followCta: '关注项目',
    communityCta: '加入社区',
    readCta: '阅读宣言',
    manifesto: [
      '我在做这个游戏，是因为我真的热爱 breaking。这个热爱是个人的、真实经历过的，也是长久的。我曾经是 b-boy，跳了很多年，如今这段历史仍然跟着我。',
      '我不想占有 breaking，也不想假装自己拥有它。我想做的是一个尊重人、尊重历史、尊重 battle 能量、也尊重地板上真实情感的作品。',
      'Breaking 没有年龄限制。即使我可以算是退休的 b-boy，我仍然属于这个文化。热爱不会过期，尊重也不会过期。',
      '目标不是复制已有的游戏或品牌，而是把旧时代 breaking 游戏的精神延伸成一种更现代、多玩家、社交化、社区驱动的形式。',
      '这个项目是独立的。它来自 breaking 文化，也来自我自己的亲身经历。它不隶属于任何品牌、联盟或现有游戏。'
    ],
    isTitle: '这个项目是什么',
    isItems: [
      '扎根于真实文化的娱乐作品。',
      '对旧式 breaking 游戏概念的现代延伸。',
      '一个承载记忆、尊重与社区的空间。',
      '把 battle 视为文化、表演与对话的游戏。'
    ],
    isNotTitle: '这个项目不是什么',
    isNotItems: [
      '它不是试图占有 breaking。',
      '它不是某个现有品牌或游戏的冷冰冰复制。',
      '它不是为了怀旧而怀旧。',
      '它不是文化的替代品，而是对文化的致敬。'
    ],
    closingTitle: '结语',
    closing: [
      '如果你是 b-boy、b-girl，或任何接近这份文化的人，我希望你能感受到“占有”和“尊重”之间的区别。',
      '这份宣言只想说明一件事：这个项目是带着认真、不是带着占有欲；是带着爱，而不是距离。'
    ],
    cards: [
      {
        label: '社区',
        title: '加入社区',
        description: '关注开发日志、阅读更新，并通过反馈和交流帮助项目成长。',
        cta: '打开开发日志',
        href: 'community'
      },
      {
        label: '赞助',
        title: '支持项目',
        description: '如果你想赞助这个项目，请直接联系我。现在没有 Patreon 或 Buy Me a Coffee，只有直接沟通。',
        cta: '打开赞助联系',
        href: 'sponsor'
      }
    ],
    sponsorSubject: 'Breakdance 3D sponsorship interest'
  }
};

export const getManifestoCopy = (locale: LocaleCode) => MANIFESTO_COPY[locale];
