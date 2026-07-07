import type { LocaleCode } from '../i18n';

export const MOVES_PATH = '/moves';
export type MoveFamily = 'toprock' | 'footwork' | 'freeze' | 'powermove';
export const MOVE_FAMILIES: MoveFamily[] = ['toprock', 'footwork', 'freeze', 'powermove'];

export type PublicMove = {
  id: string;
  label: string;
  family: MoveFamily;
  durationBeats: number;
  status: 'playable' | 'prototype';
  skills: string[];
  steps: Array<'toprock' | 'footwork' | 'freeze' | 'powermove' | 'move'>;
  stickPath?: string;
  note?: string;
};

// Public editorial projection of apps/game/src/game/move/data/moves.json.
// Keep this data local to the website: the website must not import game runtime source.
export const PUBLIC_MOVES: PublicMove[] = [
  {
    id: 'toprock-indianstep', label: 'Indian Step', family: 'toprock', durationBeats: 4,
    status: 'prototype', skills: ['rhythm', 'timing', 'coordination'],
    steps: ['toprock', 'freeze', 'powermove'],
  },
  {
    id: 'default-footwork', label: 'Footwork', family: 'footwork', durationBeats: 4,
    status: 'playable', skills: ['timing', 'direction', 'flow'],
    steps: ['footwork'],
    stickPath: '● → ↖ → ↘ → ●'
  },
  {
    id: 'default-powermove', label: 'Powermove', family: 'powermove', durationBeats: 2,
    status: 'playable', skills: ['coordination', 'precision', 'balance'],
    steps: ['powermove'],
    stickPath: '↑ → → ↓ → ← → ↑'
  },
  {
    id: 'default-freeze', label: 'Freeze', family: 'freeze', durationBeats: 4,
    status: 'playable', skills: ['timing', 'control', 'hold'],
    steps: ['freeze'],
    stickPath: '● ↔ ±0.15'
  }
];

type MovesCopy = {
  seoTitle: string; seoDescription: string; eyebrow: string; title: string; lead: string;
  noticeTitle: string; notice: string; playable: string; prototype: string; beats: string;
  skills: string; execution: string; path: string; action: Record<PublicMove['steps'][number], string>;
  playCta: string; developmentTitle: string; developmentText: string;
  prototypeNote: string;
  mainButton: string; openMove: string; backToMoves: string; sequenceLead: string; singleButtonLead: string;
  openFamily: string; searchLabel: string; searchPlaceholder: string; noResults: string; movesFound: string;
  familyLabel: Record<MoveFamily, string>;
};

export const MOVES_COPY: Record<LocaleCode, MovesCopy> = {
  'en-US': {
    seoTitle: 'Move catalog · BboyArena', seoDescription: 'Explore the moves currently defined in the BboyArena prototype, with main buttons, variation instructions, and honest development status.',
    eyebrow: 'Prototype move catalog', title: 'Moves currently on the floor.', lead: 'Explore the four base families, then open one to browse and search the moves currently recorded in its catalog.',
    noticeTitle: 'Game instructions, not physical coaching', notice: 'These pages describe prototype buttons and stick paths. They are not instructions for safely performing breaking moves with your body. Learn physical technique with a qualified coach and suitable preparation.',
    playable: 'Playable now', prototype: 'Catalogued prototype', beats: 'beats', skills: 'Skills', execution: 'Variation instructions', path: 'Stick guide',
    action: { toprock: 'Press Toprock', footwork: 'Press Footwork', freeze: 'Press Freeze', powermove: 'Press Powermove', move: 'Follow the movement stick' },
    playCta: 'Open the game prototype', developmentTitle: 'A catalog is not the finished game', developmentText: 'Cue scoring, transition windows, physical animations, and variation selection are still under development. This page reflects the data that exists today without presenting planned behavior as complete.',
    prototypeNote: 'The recipe exists in the catalog, but the current gameplay queue cannot select this variation.',
    mainButton: 'Main button', openMove: 'Open move', backToMoves: 'Back to all moves', sequenceLead: 'Start with the main button, then enter the variation buttons in this order.', singleButtonLead: 'Use the main button to request this move.',
    openFamily: 'Explore family', searchLabel: 'Search this family', searchPlaceholder: 'Search moves or skills', noResults: 'No moves match this search.', movesFound: 'moves in this family',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  },
  'it-IT': {
    seoTitle: 'Catalogo mosse · BboyArena', seoDescription: 'Esplora le mosse definite nel prototipo BboyArena con pulsanti principali, istruzioni delle varianti e stato di sviluppo.',
    eyebrow: 'Catalogo mosse prototipo', title: 'Le mosse attualmente sul floor.', lead: 'Esplora le quattro famiglie base, poi aprine una per sfogliare e cercare le mosse attualmente presenti nel suo catalogo.',
    noticeTitle: 'Istruzioni di gioco, non allenamento fisico', notice: 'Queste pagine descrivono pulsanti e traiettorie degli stick del prototipo. Non insegnano a eseguire fisicamente le mosse di breaking in sicurezza. Per la tecnica corporea affidati a un coach qualificato e a una preparazione adeguata.',
    playable: 'Giocabile ora', prototype: 'Prototipo catalogato', beats: 'beat', skills: 'Abilità', execution: 'Istruzioni della variante', path: 'Guida stick',
    action: { toprock: 'Premi Toprock', footwork: 'Premi Footwork', freeze: 'Premi Freeze', powermove: 'Premi Powermove', move: 'Segui la traccia dello stick di movimento' },
    playCta: 'Apri il prototipo', developmentTitle: 'Un catalogo non è il gioco finito', developmentText: 'Punteggio dei cue, finestre di transizione, animazioni fisiche e selezione delle varianti sono ancora in sviluppo. Questa pagina racconta i dati disponibili oggi senza presentare come complete le funzioni pianificate.',
    prototypeNote: 'La sequenza esiste nel catalogo, ma la coda di gioco attuale non può ancora selezionare questa variante.',
    mainButton: 'Pulsante principale', openMove: 'Apri mossa', backToMoves: 'Torna a tutte le mosse', sequenceLead: 'Parti dal pulsante principale, poi inserisci i pulsanti della variante in questo ordine.', singleButtonLead: 'Usa il pulsante principale per richiedere questa mossa.',
    openFamily: 'Esplora famiglia', searchLabel: 'Cerca nella famiglia', searchPlaceholder: 'Cerca mosse o abilità', noResults: 'Nessuna mossa corrisponde alla ricerca.', movesFound: 'mosse in questa famiglia',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  },
  'es-419': {
    seoTitle: 'Catálogo de movimientos · BboyArena', seoDescription: 'Explora los movimientos definidos en el prototipo BboyArena, sus controles, ritmo y estado de desarrollo.',
    eyebrow: 'Catálogo del prototipo', title: 'Movimientos que están en el floor.', lead: 'Explora las cuatro familias base y abre una para navegar y buscar los movimientos presentes en su catálogo.',
    noticeTitle: 'Instrucciones del juego, no entrenamiento físico', notice: 'Estas páginas describen botones y rutas de stick del prototipo. No enseñan a ejecutar movimientos físicos de breaking de forma segura. Aprende la técnica corporal con un coach calificado y preparación adecuada.',
    playable: 'Jugable ahora', prototype: 'Prototipo catalogado', beats: 'beats', skills: 'Habilidades', execution: 'Instrucciones de la variante', path: 'Guía del stick',
    action: { toprock: 'Pulsa Toprock', footwork: 'Pulsa Footwork', freeze: 'Pulsa Freeze', powermove: 'Pulsa Powermove', move: 'Sigue la ruta del stick de movimiento' },
    playCta: 'Abrir el prototipo', developmentTitle: 'Un catálogo no es el juego terminado', developmentText: 'La puntuación de cues, las ventanas de transición, las animaciones físicas y la selección de variantes siguen en desarrollo. Esta página muestra lo que existe hoy sin presentar planes como funciones terminadas.',
    prototypeNote: 'La secuencia existe en el catálogo, pero la cola actual del juego todavía no puede seleccionar esta variante.',
    mainButton: 'Botón principal', openMove: 'Abrir movimiento', backToMoves: 'Volver a movimientos', sequenceLead: 'Empieza con el botón principal y luego introduce los botones de la variante en este orden.', singleButtonLead: 'Usa el botón principal para solicitar este movimiento.',
    openFamily: 'Explorar familia', searchLabel: 'Buscar en esta familia', searchPlaceholder: 'Buscar movimientos o habilidades', noResults: 'No hay movimientos que coincidan.', movesFound: 'movimientos en esta familia',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  },
  'pt-BR': {
    seoTitle: 'Catálogo de movimentos · BboyArena', seoDescription: 'Explore os movimentos definidos no protótipo BboyArena, com controles, ritmo e status de desenvolvimento.',
    eyebrow: 'Catálogo do protótipo', title: 'Movimentos que estão no floor.', lead: 'Explore as quatro famílias básicas e abra uma para navegar e buscar os movimentos presentes no catálogo.',
    noticeTitle: 'Instruções do jogo, não treino físico', notice: 'Estas páginas descrevem botões e trajetórias do stick no protótipo. Elas não ensinam a executar movimentos físicos de breaking com segurança. Aprenda a técnica corporal com um coach qualificado e preparação adequada.',
    playable: 'Jogável agora', prototype: 'Protótipo catalogado', beats: 'beats', skills: 'Habilidades', execution: 'Instruções da variação', path: 'Guia do stick',
    action: { toprock: 'Pressione Toprock', footwork: 'Pressione Footwork', freeze: 'Pressione Freeze', powermove: 'Pressione Powermove', move: 'Siga a trajetória do stick de movimento' },
    playCta: 'Abrir o protótipo', developmentTitle: 'Um catálogo não é o jogo pronto', developmentText: 'Pontuação dos cues, janelas de transição, animações físicas e seleção de variações ainda estão em desenvolvimento. Esta página mostra os dados atuais sem apresentar planos como recursos concluídos.',
    prototypeNote: 'A sequência existe no catálogo, mas a fila atual do jogo ainda não consegue selecionar essa variação.',
    mainButton: 'Botão principal', openMove: 'Abrir movimento', backToMoves: 'Voltar aos movimentos', sequenceLead: 'Comece com o botão principal e depois insira os botões da variação nesta ordem.', singleButtonLead: 'Use o botão principal para solicitar este movimento.',
    openFamily: 'Explorar família', searchLabel: 'Buscar nesta família', searchPlaceholder: 'Buscar movimentos ou habilidades', noResults: 'Nenhum movimento corresponde à busca.', movesFound: 'movimentos nesta família',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  },
  'zh-Hans': {
    seoTitle: '动作目录 · BboyArena', seoDescription: '查看 BboyArena 原型中已定义的动作、主按钮、变体操作说明和开发状态。',
    eyebrow: '原型动作目录', title: '当前已进入 floor 的动作。', lead: '浏览四个基础分类，然后进入分类查看并搜索当前目录中的动作。',
    noticeTitle: '这是游戏操作说明，不是身体训练', notice: '这些页面描述原型中的按钮和摇杆路径，并非安全完成真实 breaking 动作的教学。身体技术请在合格教练指导和适当准备下学习。',
    playable: '目前可玩', prototype: '已收录的原型', beats: '拍', skills: '能力', execution: '变体操作说明', path: '摇杆指引',
    action: { toprock: '按 Toprock', footwork: '按 Footwork', freeze: '按 Freeze', powermove: '按 Powermove', move: '跟随移动摇杆轨迹' },
    playCta: '打开游戏原型', developmentTitle: '动作目录不等于完整游戏', developmentText: '提示评分、转换窗口、身体动画和变体选择仍在开发中。本页如实展示当前已有数据，不把规划中的功能说成已完成。',
    prototypeNote: '该序列已存在于目录中，但当前游戏队列还无法选择这个变体。',
    mainButton: '主按钮', openMove: '打开动作', backToMoves: '返回全部动作', sequenceLead: '先按主按钮，再按以下顺序输入变体按钮。', singleButtonLead: '使用主按钮请求这个动作。',
    openFamily: '查看分类', searchLabel: '在此分类中搜索', searchPlaceholder: '搜索动作或能力', noResults: '没有符合搜索条件的动作。', movesFound: '个动作属于此分类',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  }
};

export const getMovesCopy = (locale: LocaleCode) => MOVES_COPY[locale];
