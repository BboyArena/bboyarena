import type { LocaleCode } from '../i18n';

export const MOVES_PATH = '/moves';
export type MoveFamily = 'toprock' | 'footwork' | 'freeze' | 'powermove';
export const MOVE_FAMILIES: MoveFamily[] = ['toprock', 'footwork', 'freeze', 'powermove'];

export type PublicStickPoint = {
  t: number;
  x: number;
  y: number;
  tolerance?: number;
};

export type PublicStickTracks = {
  left: PublicStickPoint[];
  right: PublicStickPoint[];
};

export type PublicMove = {
  id: string;
  label: string;
  family: MoveFamily;
  durationBeats: number;
  status: 'playable' | 'prototype';
  skills: string[];
  stickTracks: PublicStickTracks;
  note?: string;
};

// Public editorial projection of apps/game/src/game/move/data/moves.json.
// Keep this data local to the website: the website must not import game runtime source.
export const PUBLIC_MOVES: PublicMove[] = [
  {
    id: 'toprock-indianstep', label: 'Indian Step', family: 'toprock', durationBeats: 4,
    status: 'prototype', skills: ['rhythm', 'timing', 'coordination'],
    stickTracks: {
      left: [
        { t: 0, x: 0, y: 0 }, { t: 0.25, x: -0.65, y: 0.5 },
        { t: 0.5, x: 0, y: 0 }, { t: 0.75, x: 0.65, y: 0.5 }, { t: 1, x: 0, y: 0 }
      ],
      right: [
        { t: 0, x: 0, y: 0 }, { t: 0.25, x: 0.7, y: 0.7 },
        { t: 0.5, x: 0, y: 0 }, { t: 0.75, x: -0.7, y: 0.7 }, { t: 1, x: 0, y: 0 }
      ]
    }
  },
  {
    id: 'footwork-threestep', label: 'Three-step', family: 'footwork', durationBeats: 3,
    status: 'playable', skills: ['timing', 'direction', 'flow'],
    stickTracks: {
      left: [
        { t: 0, x: 0, y: 0 }, { t: 0.333333, x: 0.55, y: 0.25 },
        { t: 0.666667, x: -0.55, y: 0.25 }, { t: 1, x: 0, y: 0 }
      ],
      right: [
        { t: 0, x: 0, y: 0 }, { t: 0.333333, x: -0.8, y: 0.35 },
        { t: 0.666667, x: 0.8, y: -0.35 }, { t: 1, x: 0, y: 0 }
      ]
    }
  },
  {
    id: 'footwork-sixstep', label: 'Six-step', family: 'footwork', durationBeats: 6,
    status: 'prototype', skills: ['timing', 'direction', 'flow', 'coordination'],
    stickTracks: {
      left: [
        { t: 0, x: 0, y: 0 }, { t: 0.166667, x: 0.45, y: 0.35 },
        { t: 0.333333, x: 0.6, y: 0 }, { t: 0.5, x: 0, y: -0.35 },
        { t: 0.666667, x: -0.6, y: 0 }, { t: 0.833333, x: -0.45, y: 0.35 },
        { t: 1, x: 0, y: 0 }
      ],
      right: [
        { t: 0, x: 0, y: 0 }, { t: 0.166667, x: -0.7, y: 0.55 },
        { t: 0.333333, x: -0.85, y: 0 }, { t: 0.5, x: 0, y: -0.7 },
        { t: 0.666667, x: 0.85, y: 0 }, { t: 0.833333, x: 0.7, y: 0.55 },
        { t: 1, x: 0, y: 0 }
      ]
    }
  },
  {
    id: 'default-powermove', label: 'Powermove', family: 'powermove', durationBeats: 2,
    status: 'playable', skills: ['coordination', 'precision', 'balance'],
    stickTracks: {
      left: [
        { t: 0, x: 0, y: -0.65, tolerance: 0.35 }, { t: 0.25, x: -0.65, y: 0, tolerance: 0.35 },
        { t: 0.5, x: 0, y: 0.65, tolerance: 0.35 }, { t: 0.75, x: 0.65, y: 0, tolerance: 0.35 },
        { t: 1, x: 0, y: -0.65, tolerance: 0.35 }
      ],
      right: [
        { t: 0, x: 0, y: 1, tolerance: 0.3 }, { t: 0.25, x: 1, y: 0, tolerance: 0.3 },
        { t: 0.5, x: 0, y: -1, tolerance: 0.3 }, { t: 0.75, x: -1, y: 0, tolerance: 0.3 },
        { t: 1, x: 0, y: 1, tolerance: 0.3 }
      ]
    }
  },
  {
    id: 'default-freeze', label: 'Freeze', family: 'freeze', durationBeats: 4,
    status: 'playable', skills: ['timing', 'control', 'hold'],
    stickTracks: {
      left: [
        { t: 0, x: 0, y: 0, tolerance: 0.18 }, { t: 0.5, x: -0.15, y: 0.15, tolerance: 0.15 },
        { t: 1, x: 0, y: 0, tolerance: 0.18 }
      ],
      right: [
        { t: 0, x: 0, y: 0, tolerance: 0.18 }, { t: 0.5, x: 0.15, y: 0.15, tolerance: 0.15 },
        { t: 1, x: 0, y: 0, tolerance: 0.18 }
      ]
    }
  }
];

export type MovesCopy = {
  seoTitle: string; seoDescription: string; eyebrow: string; title: string; lead: string;
  noticeTitle: string; notice: string; playable: string; prototype: string; beats: string;
  skills: string; execution: string; sequenceIntro: string; step: string; start: string; finish: string;
  leftStick: string; rightStick: string; upperBody: string; lowerBody: string;
  direction: Record<'center' | 'up' | 'down' | 'left' | 'right' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight', string>;
  playCta: string; developmentTitle: string; developmentText: string;
  stickGrammarTitle: string; stickGrammarText: string;
  mainButton: string; openMove: string; backToMoves: string;
  openFamily: string; searchLabel: string; searchPlaceholder: string; noResults: string; movesFound: string;
  familyLabel: Record<MoveFamily, string>;
};

export const MOVES_COPY: Record<LocaleCode, MovesCopy> = {
  'en-US': {
    seoTitle: 'Move catalog · BboyArena', seoDescription: 'Explore the moves currently defined in the BboyArena prototype, with synchronized stick sequences and honest development status.',
    eyebrow: 'Prototype move catalog', title: 'Moves currently on the floor.', lead: 'Explore the four base families, then open one to browse and search the moves currently recorded in its catalog.',
    noticeTitle: 'Game instructions, not physical coaching', notice: 'These pages describe prototype buttons and directional inputs. They are not instructions for safely performing breaking moves with your body. Learn physical technique with a qualified coach and suitable preparation.',
    playable: 'Playable now', prototype: 'Catalogued prototype', beats: 'beats', skills: 'Skills', execution: 'Stick sequence', sequenceIntro: 'Follow both positions together. Each card is one synchronized moment in the move.', step: 'Step', start: 'Start', finish: 'Finish', leftStick: 'Left stick', rightStick: 'Right stick', upperBody: 'Torso + shoulders', lowerBody: 'Hips + legs',
    direction: { center: 'Center', up: 'Up', down: 'Down', left: 'Left', right: 'Right', upLeft: 'Upper left', upRight: 'Upper right', downLeft: 'Lower left', downRight: 'Lower right' },
    playCta: 'Open the game prototype', developmentTitle: 'A catalog is not the finished game', developmentText: 'Cue scoring, transition windows, physical animations, and variation selection are still under development. This page reflects the data that exists today without presenting planned behavior as complete.',
    stickGrammarTitle: 'One grammar, two trajectories', stickGrammarText: 'Follow both guides together: the left stick controls upper-body direction for torso and shoulders; the right stick controls lower-body direction for hips and legs. The prototype shows the targets, but does not yet score their accuracy.',
    mainButton: 'Main button', openMove: 'Open move', backToMoves: 'Back to all moves',
    openFamily: 'Explore family', searchLabel: 'Search this family', searchPlaceholder: 'Search moves or skills', noResults: 'No moves match this search.', movesFound: 'moves in this family',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  },
  'it-IT': {
    seoTitle: 'Catalogo mosse · BboyArena', seoDescription: 'Esplora le mosse definite nel prototipo BboyArena con sequenze sincronizzate degli stick e stato di sviluppo.',
    eyebrow: 'Catalogo mosse prototipo', title: 'Le mosse attualmente sul floor.', lead: 'Esplora le quattro famiglie base, poi aprine una per sfogliare e cercare le mosse attualmente presenti nel suo catalogo.',
    noticeTitle: 'Istruzioni di gioco, non allenamento fisico', notice: 'Queste pagine descrivono pulsanti e input direzionali del prototipo. Non insegnano a eseguire fisicamente le mosse di breaking in sicurezza. Per la tecnica corporea affidati a un coach qualificato e a una preparazione adeguata.',
    playable: 'Giocabile ora', prototype: 'Prototipo catalogato', beats: 'beat', skills: 'Abilità', execution: 'Sequenza degli stick', sequenceIntro: 'Segui le due posizioni insieme. Ogni scheda rappresenta un momento sincronizzato della mossa.', step: 'Passaggio', start: 'Inizio', finish: 'Fine', leftStick: 'Stick sinistro', rightStick: 'Stick destro', upperBody: 'Torso + spalle', lowerBody: 'Bacino + gambe',
    direction: { center: 'Centro', up: 'Su', down: 'Giù', left: 'Sinistra', right: 'Destra', upLeft: 'Alto a sinistra', upRight: 'Alto a destra', downLeft: 'Basso a sinistra', downRight: 'Basso a destra' },
    playCta: 'Apri il prototipo', developmentTitle: 'Un catalogo non è il gioco finito', developmentText: 'Punteggio dei cue, finestre di transizione, animazioni fisiche e selezione delle varianti sono ancora in sviluppo. Questa pagina racconta i dati disponibili oggi senza presentare come complete le funzioni pianificate.',
    stickGrammarTitle: 'Una grammatica, due traiettorie', stickGrammarText: 'Segui le due guide insieme: lo stick sinistro controlla la direzione dell’upper body, quindi torso e spalle; lo stick destro controlla il lower body, quindi bacino e gambe. Il prototipo mostra i target, ma non valuta ancora la precisione.',
    mainButton: 'Pulsante principale', openMove: 'Apri mossa', backToMoves: 'Torna a tutte le mosse',
    openFamily: 'Esplora famiglia', searchLabel: 'Cerca nella famiglia', searchPlaceholder: 'Cerca mosse o abilità', noResults: 'Nessuna mossa corrisponde alla ricerca.', movesFound: 'mosse in questa famiglia',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  },
  'es-419': {
    seoTitle: 'Catálogo de movimientos · BboyArena', seoDescription: 'Explora los movimientos definidos en el prototipo BboyArena, sus controles, ritmo y estado de desarrollo.',
    eyebrow: 'Catálogo del prototipo', title: 'Movimientos que están en el floor.', lead: 'Explora las cuatro familias base y abre una para navegar y buscar los movimientos presentes en su catálogo.',
    noticeTitle: 'Instrucciones del juego, no entrenamiento físico', notice: 'Estas páginas describen botones y entradas direccionales del prototipo. No enseñan a ejecutar movimientos físicos de breaking de forma segura. Aprende la técnica corporal con un coach calificado y preparación adecuada.',
    playable: 'Jugable ahora', prototype: 'Prototipo catalogado', beats: 'beats', skills: 'Habilidades', execution: 'Secuencia de sticks', sequenceIntro: 'Sigue ambas posiciones a la vez. Cada tarjeta representa un momento sincronizado del movimiento.', step: 'Paso', start: 'Inicio', finish: 'Final', leftStick: 'Stick izquierdo', rightStick: 'Stick derecho', upperBody: 'Torso + hombros', lowerBody: 'Cadera + piernas',
    direction: { center: 'Centro', up: 'Arriba', down: 'Abajo', left: 'Izquierda', right: 'Derecha', upLeft: 'Arriba izquierda', upRight: 'Arriba derecha', downLeft: 'Abajo izquierda', downRight: 'Abajo derecha' },
    playCta: 'Abrir el prototipo', developmentTitle: 'Un catálogo no es el juego terminado', developmentText: 'La puntuación de cues, las ventanas de transición, las animaciones físicas y la selección de variantes siguen en desarrollo. Esta página muestra lo que existe hoy sin presentar planes como funciones terminadas.',
    stickGrammarTitle: 'Una gramática, dos trayectorias', stickGrammarText: 'Sigue las dos guías a la vez: el stick izquierdo controla la dirección de la parte superior del cuerpo, torso y hombros; el derecho controla la parte inferior, cadera y piernas. El prototipo muestra los objetivos, pero todavía no puntúa la precisión.',
    mainButton: 'Botón principal', openMove: 'Abrir movimiento', backToMoves: 'Volver a movimientos',
    openFamily: 'Explorar familia', searchLabel: 'Buscar en esta familia', searchPlaceholder: 'Buscar movimientos o habilidades', noResults: 'No hay movimientos que coincidan.', movesFound: 'movimientos en esta familia',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  },
  'pt-BR': {
    seoTitle: 'Catálogo de movimentos · BboyArena', seoDescription: 'Explore os movimentos definidos no protótipo BboyArena, com controles, ritmo e status de desenvolvimento.',
    eyebrow: 'Catálogo do protótipo', title: 'Movimentos que estão no floor.', lead: 'Explore as quatro famílias básicas e abra uma para navegar e buscar os movimentos presentes no catálogo.',
    noticeTitle: 'Instruções do jogo, não treino físico', notice: 'Estas páginas descrevem botões e entradas direcionais do protótipo. Elas não ensinam a executar movimentos físicos de breaking com segurança. Aprenda a técnica corporal com um coach qualificado e preparação adequada.',
    playable: 'Jogável agora', prototype: 'Protótipo catalogado', beats: 'beats', skills: 'Habilidades', execution: 'Sequência dos sticks', sequenceIntro: 'Siga as duas posições ao mesmo tempo. Cada cartão representa um momento sincronizado do movimento.', step: 'Passo', start: 'Início', finish: 'Fim', leftStick: 'Stick esquerdo', rightStick: 'Stick direito', upperBody: 'Tronco + ombros', lowerBody: 'Quadril + pernas',
    direction: { center: 'Centro', up: 'Cima', down: 'Baixo', left: 'Esquerda', right: 'Direita', upLeft: 'Cima à esquerda', upRight: 'Cima à direita', downLeft: 'Baixo à esquerda', downRight: 'Baixo à direita' },
    playCta: 'Abrir o protótipo', developmentTitle: 'Um catálogo não é o jogo pronto', developmentText: 'Pontuação dos cues, janelas de transição, animações físicas e seleção de variações ainda estão em desenvolvimento. Esta página mostra os dados atuais sem apresentar planos como recursos concluídos.',
    stickGrammarTitle: 'Uma gramática, duas trajetórias', stickGrammarText: 'Siga as duas guias ao mesmo tempo: o stick esquerdo controla a direção da parte superior do corpo, tronco e ombros; o direito controla a parte inferior, quadril e pernas. O protótipo mostra os alvos, mas ainda não pontua a precisão.',
    mainButton: 'Botão principal', openMove: 'Abrir movimento', backToMoves: 'Voltar aos movimentos',
    openFamily: 'Explorar família', searchLabel: 'Buscar nesta família', searchPlaceholder: 'Buscar movimentos ou habilidades', noResults: 'Nenhum movimento corresponde à busca.', movesFound: 'movimentos nesta família',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  },
  'zh-Hans': {
    seoTitle: '动作目录 · BboyArena', seoDescription: '查看 BboyArena 原型中已定义的动作、同步摇杆序列和开发状态。',
    eyebrow: '原型动作目录', title: '当前已进入 floor 的动作。', lead: '浏览四个基础分类，然后进入分类查看并搜索当前目录中的动作。',
    noticeTitle: '这是游戏操作说明，不是身体训练', notice: '这些页面描述原型中的按钮和摇杆路径，并非安全完成真实 breaking 动作的教学。身体技术请在合格教练指导和适当准备下学习。',
    playable: '目前可玩', prototype: '已收录的原型', beats: '拍', skills: '能力', execution: '摇杆序列', sequenceIntro: '同时跟随两个位置。每张卡片代表动作中一个同步时刻。', step: '步骤', start: '开始', finish: '结束', leftStick: '左摇杆', rightStick: '右摇杆', upperBody: '躯干 + 肩膀', lowerBody: '髋部 + 腿',
    direction: { center: '居中', up: '上', down: '下', left: '左', right: '右', upLeft: '左上', upRight: '右上', downLeft: '左下', downRight: '右下' },
    playCta: '打开游戏原型', developmentTitle: '动作目录不等于完整游戏', developmentText: '提示评分、转换窗口、身体动画和变体选择仍在开发中。本页如实展示当前已有数据，不把规划中的功能说成已完成。',
    stickGrammarTitle: '一套规则，两条轨迹', stickGrammarText: '同时跟随两条指引：左摇杆控制上半身方向，也就是躯干和肩膀；右摇杆控制下半身方向，也就是髋部和腿。原型会显示目标，但目前还不会为准确度评分。',
    mainButton: '主按钮', openMove: '打开动作', backToMoves: '返回全部动作',
    openFamily: '查看分类', searchLabel: '在此分类中搜索', searchPlaceholder: '搜索动作或能力', noResults: '没有符合搜索条件的动作。', movesFound: '个动作属于此分类',
    familyLabel: { toprock: 'Toprock', footwork: 'Footwork', freeze: 'Freeze', powermove: 'Powermoves' }
  }
};

export const getMovesCopy = (locale: LocaleCode) => MOVES_COPY[locale];
