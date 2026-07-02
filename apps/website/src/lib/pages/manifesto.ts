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
  installTitle: string;
  installDescription: string;
  installCta: string;
  installFallback: string;
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
    seoDescription: 'BboyArena is a free-to-play, open-community breaking game built in public, one movement and one release at a time.',
    heroLabel: 'Manifesto',
    heroTitle: 'We are building the infrastructure of Breaking.',
    heroLead: 'Not just a game: an open, free-to-play digital space built in public with the people who live and care about breaking culture.',
    followCta: 'Follow the project',
    communityCta: 'Join the community',
    readCta: 'Read the manifesto',
    manifesto: [
      'BboyArena starts as a free-to-play, open-community project. Development happens in public: every build adds logic, movement, rhythm, and another piece of the 3D engine.',
      'The code is only the beginning. The goal is to turn breaking knowledge, memory, battles, and community into a digital space that can grow without claiming ownership of the culture.',
      'Want to test the next feature first? Follow the lognotes and keep the app installed. You will see experiments become systems and code become movement.',
      'The project is independent and shaped through visible work, honest limitations, and community feedback. It is not affiliated with any brand, league, or existing game.',
      'Stay connected to the build. This is a living construction site, and every release is another step onto the floor.'
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
      'BboyArena is built with care, not claim; with visible work, not distance.',
      'Install the PWA for direct access to the construction site. Push updates will join this channel when they are ready.'
    ],
    installTitle: 'Stay connected to the build',
    installDescription: 'Install the PWA for direct access to devlogs, experiments, and every new feature as it comes online.',
    installCta: 'Install PWA & follow development',
    installFallback: 'Use your browser menu and choose “Install app” or “Add to Home Screen”.',
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
    seoDescription: 'BboyArena è un gioco Free2Play e Open-Community costruito in pubblico, un movimento e una release alla volta.',
    heroLabel: 'Manifesto',
    heroTitle: 'Stiamo costruendo l’infrastruttura del Breaking.',
    heroLead: 'Non soltanto un gioco: uno spazio digitale aperto e Free2Play, costruito in pubblico insieme a chi vive e rispetta la cultura breaking.',
    followCta: 'Segui il progetto',
    communityCta: 'Entra nella community',
    readCta: 'Leggi il manifesto',
    manifesto: [
      'BboyArena nasce come progetto Free2Play e Open-Community. Lo sviluppo avviene in pubblico: ogni build aggiunge logica, movimento, ritmo e un nuovo pezzo del motore 3D.',
      'Il codice è solo l’inizio. L’obiettivo è trasformare conoscenza, memoria, battle e community in uno spazio digitale che possa crescere senza pretendere di possedere la cultura.',
      'Vuoi essere il primo a testare la prossima feature? Segui le lognotes e tieni l’app installata: vedrai gli esperimenti diventare sistemi e il codice trasformarsi in movimento.',
      'Il progetto è indipendente e prende forma attraverso lavoro visibile, limiti dichiarati e feedback della community. Non è affiliato a brand, leghe o giochi esistenti.',
      'Resta connesso alla build. Questo è un cantiere vivo, e ogni release è un altro passo sul floor.'
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
      'BboyArena è costruito con cura, non con pretesa; con lavoro visibile, non da lontano.',
      'Installa la PWA per avere accesso diretto al cantiere. Le notifiche push entreranno in questo canale quando saranno pronte.'
    ],
    installTitle: 'Resta connesso alla build',
    installDescription: 'Installa la PWA per accedere direttamente a lognotes, esperimenti e nuove funzioni mentre vanno online.',
    installCta: 'Installa PWA & segui lo sviluppo',
    installFallback: 'Apri il menu del browser e scegli “Installa app” o “Aggiungi alla schermata Home”.',
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
    heroTitle: 'Estamos construyendo la infraestructura del Breaking.',
    heroLead: 'No solo un juego: un espacio digital abierto y Free2Play, construido en público con quienes viven y respetan la cultura breaking.',
    followCta: 'Seguir el proyecto',
    communityCta: 'Entrar a la comunidad',
    readCta: 'Leer el manifiesto',
    manifesto: [
      'BboyArena nace como un proyecto Free2Play y Open-Community. El desarrollo ocurre en público: cada build suma lógica, movimiento, ritmo y una nueva parte del motor 3D.',
      'El código es solo el comienzo. Queremos transformar conocimiento, memoria, battles y comunidad en un espacio digital que crezca sin pretender poseer la cultura.',
      '¿Quieres probar primero la próxima función? Sigue las lognotes y mantén la app instalada: verás cómo los experimentos se convierten en sistemas y el código en movimiento.',
      'El proyecto es independiente y toma forma mediante trabajo visible, límites honestos y feedback de la comunidad. No está afiliado a ninguna marca, liga o juego existente.',
      'Mantente conectado con la build. Este es un sitio de construcción vivo y cada release es otro paso sobre el floor.'
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
    installTitle: 'Mantente conectado con la build',
    installDescription: 'Instala la PWA para acceder directamente a las lognotes, los experimentos y las nuevas funciones.',
    installCta: 'Instalar PWA y seguir el desarrollo',
    installFallback: 'Abre el menú del navegador y elige “Instalar app” o “Agregar a la pantalla de inicio”.',
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
    heroTitle: 'Estamos construindo a infraestrutura do Breaking.',
    heroLead: 'Não apenas um jogo: um espaço digital aberto e Free2Play, construído em público com quem vive e respeita a cultura breaking.',
    followCta: 'Seguir o projeto',
    communityCta: 'Entrar na comunidade',
    readCta: 'Ler o manifesto',
    manifesto: [
      'BboyArena nasce como um projeto Free2Play e Open-Community. O desenvolvimento acontece em público: cada build adiciona lógica, movimento, ritmo e uma nova parte do motor 3D.',
      'O código é apenas o começo. Queremos transformar conhecimento, memória, battles e comunidade em um espaço digital que cresça sem tentar possuir a cultura.',
      'Quer testar a próxima funcionalidade primeiro? Acompanhe as lognotes e mantenha o app instalado: você verá experimentos virarem sistemas e código virar movimento.',
      'O projeto é independente e ganha forma por meio de trabalho visível, limites honestos e feedback da comunidade. Não é afiliado a nenhuma marca, liga ou jogo existente.',
      'Fique conectado à build. Este é um canteiro vivo, e cada release é mais um passo no floor.'
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
    installTitle: 'Fique conectado à build',
    installDescription: 'Instale a PWA para acessar diretamente lognotes, experimentos e novas funcionalidades.',
    installCta: 'Instalar PWA e acompanhar o desenvolvimento',
    installFallback: 'Abra o menu do navegador e escolha “Instalar app” ou “Adicionar à tela inicial”.',
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
    heroTitle: '我们正在构建 Breaking 的数字基础设施。',
    heroLead: '这不只是一款游戏，而是一个开放、Free2Play、与 breaking 社群共同公开构建的数字空间。',
    followCta: '关注项目',
    communityCta: '加入社区',
    readCta: '阅读宣言',
    manifesto: [
      'BboyArena 从一开始就是 Free2Play、Open-Community 项目。开发过程完全公开：每个 build 都为 3D 引擎加入新的逻辑、动作与节奏。',
      '代码只是起点。我们的目标是把知识、记忆、battle 与社区转化为持续成长的数字空间，而不是宣称拥有这份文化。',
      '想最先测试下一项功能吗？关注 lognotes，并把应用保留在设备上；你会看到实验成为系统，代码成为动作。',
      '项目保持独立，通过可见的工作、坦诚的限制和社区反馈不断成形。它不隶属于任何品牌、联盟或现有游戏。',
      '与 build 保持连接。这是一个持续运转的工地，每次 release 都是在 floor 上迈出的新一步。'
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
    installTitle: '与构建进程保持连接',
    installDescription: '安装 PWA，直接访问开发日志、实验内容与陆续上线的新功能。',
    installCta: '安装 PWA 并关注开发',
    installFallback: '打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。',
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
