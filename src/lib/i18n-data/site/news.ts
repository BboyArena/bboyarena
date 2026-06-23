import type { LocaleCode, SiteCopy } from '../../i18n-types';

export const NEWS_COPY: Record<LocaleCode, SiteCopy['news']> = {
  'en-US': {
    eyebrow: 'News hub',
    title: 'Update feed',
    intro: 'Here we separate the story of the project into three streams: the team devlog, app updates, and real scene news.',
    openArchive: 'Open',
    enterArchive: 'Enter archive',
    latestDrops: 'Latest drops',
    devlogArchive: 'Devlog archive',
    readMore: 'Read more',
    source: 'Source',
    sceneNotes: 'Scene notes',
    backToArchive: 'Back to archive',
    openSource: 'Open source',
    story: 'Story',
    metadata: 'Metadata',
    category: 'Category',
    author: 'Author',
    published: 'Published',
    updated: 'Updated',
    tags: 'Tags',
    categoryRules: 'Category rules',
    rules: {
      devlog: [
        'We talk about the process: build, art direction, gameplay, technical choices, and internal experiments.',
        'The tone can be a little more behind the scenes and less promotional.'
      ],
      app: [
        'This is where features, fixes, interface polish, and product workflow changes go.',
        'It is the right place for clear, release-oriented updates.'
      ],
      scene: [
        'This area gathers real news from an external source and brings it into the project.',
        'When the feed is active, each item can open a local noindex page or the original source.'
      ]
    },
    categories: {
      devlog: {
        label: 'Devlog',
        title: 'Devlog',
        description: 'Behind the scenes of the project: build, art direction, gameplay, and technical choices.'
      },
      app: {
        label: 'App News',
        title: 'App News',
        description: 'Updates, features, bug fixes, and workflow changes in the app.'
      },
      scene: {
        label: 'Scene News',
        title: 'Scene News',
        description: 'Real news pulled from an external source and surfaced inside the project.'
      }
    }
  },
  'it-IT': {
    eyebrow: 'Hub news',
    title: 'Feed aggiornamenti',
    intro: 'Qui separiamo il racconto del progetto in tre flussi: il devlog del team, gli aggiornamenti della app e le news reali della scena.',
    openArchive: 'Apri',
    enterArchive: 'Entra nell’archivio',
    latestDrops: 'Ultimi drop',
    devlogArchive: 'Archivio devlog',
    readMore: 'Leggi di più',
    source: 'Fonte',
    sceneNotes: 'Note scena',
    backToArchive: 'Torna all’archivio',
    openSource: 'Apri fonte',
    story: 'Storia',
    metadata: 'Metadati',
    category: 'Categoria',
    author: 'Autore',
    published: 'Pubblicato',
    updated: 'Aggiornato',
    tags: 'Tag',
    categoryRules: 'Regole categoria',
    rules: {
      devlog: [
        'Qui parliamo del processo: build, art direction, gameplay, scelte tecniche e prove interne.',
        'Il tono può essere un po’ più dietro le quinte e meno promozionale.'
      ],
      app: [
        'Qui entrano feature, fix, rifiniture dell’interfaccia e cambi di workflow della app.',
        'È il posto giusto per aggiornamenti chiari e orientati al rilascio.'
      ],
      scene: [
        'Qui confluiscono notizie reali da una fonte esterna e portate dentro il progetto.',
        'Quando il feed è attivo, ogni item può aprire una pagina locale noindex oppure la fonte originale.'
      ]
    },
    categories: {
      devlog: {
        label: 'Devlog',
        title: 'Devlog',
        description: 'Dietro le quinte del progetto: build, art direction, gameplay e scelte tecniche.'
      },
      app: {
        label: 'News app',
        title: 'News app',
        description: 'Aggiornamenti, feature, bugfix e cambi di workflow della app.'
      },
      scene: {
        label: 'News scena',
        title: 'News scena',
        description: 'Notizie reali pescate da una fonte esterna e portate dentro il progetto.'
      }
    }
  },
  'es-419': {
    eyebrow: 'Centro de noticias',
    title: 'Feed de actualizaciones',
    intro: 'Aquí separamos la historia del proyecto en tres flujos: devlog del equipo, novedades de la app y noticias reales de la escena.',
    openArchive: 'Abrir',
    enterArchive: 'Entrar al archivo',
    latestDrops: 'Últimos drops',
    devlogArchive: 'Archivo devlog',
    readMore: 'Leer más',
    source: 'Fuente',
    sceneNotes: 'Notas de escena',
    backToArchive: 'Volver al archivo',
    openSource: 'Abrir fuente',
    story: 'Historia',
    metadata: 'Metadatos',
    category: 'Categoría',
    author: 'Autor',
    published: 'Publicado',
    updated: 'Actualizado',
    tags: 'Etiquetas',
    categoryRules: 'Reglas de categoría',
    rules: {
      devlog: ['Aquí hablamos del proceso: build, dirección de arte, gameplay, decisiones técnicas y pruebas internas.', 'El tono puede ser más detrás de cámaras y menos promocional.'],
      app: ['Aquí van features, fixes, pulido de interfaz y cambios de workflow de la app.', 'Es el lugar ideal para actualizaciones claras y orientadas al release.'],
      scene: ['Aquí entran noticias reales de una fuente externa dentro del proyecto.', 'Cuando el feed está activo, cada item puede abrir una página local noindex o la fuente original.']
    },
    categories: {
      devlog: { label: 'Devlog', title: 'Devlog', description: 'Detrás de cámaras del proyecto: build, dirección de arte, gameplay y decisiones técnicas.' },
      app: { label: 'Noticias app', title: 'Noticias app', description: 'Actualizaciones, features, bugs y cambios de workflow de la app.' },
      scene: { label: 'Noticias escena', title: 'Noticias escena', description: 'Noticias reales tomadas de una fuente externa y llevadas al proyecto.' }
    }
  },
  'pt-BR': {
    eyebrow: 'Central de notícias',
    title: 'Feed de atualizações',
    intro: 'Aqui separamos a história do projeto em três fluxos: devlog da equipe, novidades do app e notícias reais da cena.',
    openArchive: 'Abrir',
    enterArchive: 'Entrar no arquivo',
    latestDrops: 'Últimos drops',
    devlogArchive: 'Arquivo devlog',
    readMore: 'Ler mais',
    source: 'Fonte',
    sceneNotes: 'Notas da cena',
    backToArchive: 'Voltar ao arquivo',
    openSource: 'Abrir fonte',
    story: 'História',
    metadata: 'Metadados',
    category: 'Categoria',
    author: 'Autor',
    published: 'Publicado',
    updated: 'Atualizado',
    tags: 'Tags',
    categoryRules: 'Regras da categoria',
    rules: {
      devlog: ['Aqui falamos do processo: build, direção de arte, gameplay, decisões técnicas e testes internos.', 'O tom pode ser mais bastidores e menos promocional.'],
      app: ['Aqui entram features, correções, polimento da interface e mudanças de workflow do app.', 'É o lugar certo para atualizações claras e orientadas a release.'],
      scene: ['Aqui entram notícias reais vindas de uma fonte externa para dentro do projeto.', 'Quando o feed está ativo, cada item pode abrir uma página local noindex ou a fonte original.']
    },
    categories: {
      devlog: { label: 'Devlog', title: 'Devlog', description: 'Bastidores do projeto: build, direção de arte, gameplay e decisões técnicas.' },
      app: { label: 'Novidades do app', title: 'Novidades do app', description: 'Atualizações, recursos, correções e mudanças de workflow do app.' },
      scene: { label: 'Notícias da cena', title: 'Notícias da cena', description: 'Notícias reais puxadas de uma fonte externa e trazidas para o projeto.' }
    }
  },
  'zh-Hans': {
    eyebrow: '新闻中心',
    title: '更新流',
    intro: '这里把项目故事分成三条线：团队开发日志、应用更新，以及真实的圈内新闻。',
    openArchive: '打开',
    enterArchive: '进入档案',
    latestDrops: '最新更新',
    devlogArchive: '开发日志档案',
    readMore: '阅读更多',
    source: '来源',
    sceneNotes: '圈内备注',
    backToArchive: '返回档案',
    openSource: '打开来源',
    story: '故事',
    metadata: '元数据',
    category: '分类',
    author: '作者',
    published: '发布时间',
    updated: '更新时间',
    tags: '标签',
    categoryRules: '分类规则',
    rules: {
      devlog: ['这里讲的是过程：构建、视觉方向、玩法、技术选择和内部测试。', '语气可以更偏幕后一些。'],
      app: ['这里放功能、修复、界面打磨和应用工作流变化。', '适合清晰、面向发布的更新。'],
      scene: ['这里收集外部来源的真实新闻并放进项目里。', '当 feed 可用时，每个条目可以打开本地 noindex 页面或原始来源。']
    },
    categories: {
      devlog: { label: '开发日志', title: '开发日志', description: '项目幕后：构建、视觉方向、玩法和技术选择。' },
      app: { label: '应用新闻', title: '应用新闻', description: '应用内的更新、功能、修复和工作流变化。' },
      scene: { label: '圈内新闻', title: '圈内新闻', description: '从外部来源抓取的真实新闻并展示到项目中。' }
    }
  }
};
