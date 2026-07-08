import defaultCopy from './locales/en-US.json';

export const SUPPORTED_LOCALES = ['en-US', 'it-IT', 'es-419', 'pt-BR', 'zh-Hans'] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = 'en-US';

export interface GameCopy {
  crewStatus: string;
  score: string;
  selectedCrew: string;
  stamina: string;
  timer: string;
  round: string;
  moveList: string;
  soundOn: string;
  soundOff: string;
  selectCrew: string;
  chooseStreetTone: string;
  battleComplete: string;
  startRound: string;
  pause: string;
  finishRound: string;
  resume: string;
  reset: string;
  playAgain: string;
  hitBeat: string;
  tapForScore: string;
  beat: string;
  sceneSelector: string;
  playStatus: string;
  backToMenu: string;
  splashKicker: string;
  welcome: string;
  enterLobby: string;
  splashDescription: string;
  continue: string;
  mainMenuSubtitle: string;
  gameModes: string;
  storyMode: string;
  storyModeNote: string;
  training: string;
  trainingNote: string;
  options: string;
  optionsNote: string;
  creditsMenuTitle: string;
  creditsMenuNote: string;
  levelMeta: string;
  addCurrency: string;
  settings: string;
  displayAndInput: string;
  settingsDescription: string;
  prototypePanel: string;
  audio: string;
  soundMix: string;
  soundMixDescription: string;
  fourChannels: string;
  internalMusic: string;
  internalMusicDescription: string;
  trainingRhythmSource: string;
  gameMusic: string;
  gameMusicNote: string;
  bringYourMusic: string;
  bringYourMusicNote: string;
  bringYourMusicInstructions: string;
  tapBpm: string;
  tapBpmHint: string;
  manualBpm: string;
  manualBpmNote: string;
  display: string;
  visualSetup: string;
  visualSetupDescription: string;
  screen: string;
  controls: string;
  inputMap: string;
  inputMapDescription: string;
  input: string;
  accessibility: string;
  assistOptions: string;
  assistOptionsDescription: string;
  access: string;
  changesPlaceholder: string;
  credits: string;
  projectNotes: string;
  creditsDescription: string;
  openSource: string;
  team: string;
  independentSoloBuild: string;
  independentSoloBuildDescription: string;
  openDev: string;
  tools: string;
  stackTitle: string;
  stackDescription: string;
  stack: string;
  visualDirection: string;
  urbanArcadeBase: string;
  urbanArcadeBaseDescription: string;
  style: string;
  creditsFooter: string;
  illustratedLobbyNo3d: string;
  playScene: string;
  storyModePlayTitle: string;
  trainingPlayTitle: string;
  playSceneDescription: string;
  topRock: string;
  freeze: string;
  swipe: string;
  footwork: string;
}

interface LoadedGameCopy {
  locale: LocaleCode;
  copy: GameCopy;
}

type LocaleModule = { default: GameCopy };

const DEFAULT_GAME_COPY = defaultCopy as GameCopy;

const localeLoaders: Record<LocaleCode, () => Promise<LocaleModule>> = {
  'en-US': () => Promise.resolve({ default: DEFAULT_GAME_COPY }),
  'it-IT': () => import('./locales/it-IT.json') as Promise<LocaleModule>,
  'es-419': () => import('./locales/es-419.json') as Promise<LocaleModule>,
  'pt-BR': () => import('./locales/pt-BR.json') as Promise<LocaleModule>,
  'zh-Hans': () => import('./locales/zh-Hans.json') as Promise<LocaleModule>
};

const localeCache = new Map<LocaleCode, Promise<GameCopy>>();

export const normalizeLocale = (locale: string = DEFAULT_LOCALE): LocaleCode => {
  if (SUPPORTED_LOCALES.includes(locale as LocaleCode)) {
    return locale as LocaleCode;
  }

  const language = locale.toLowerCase().split('-')[0];

  switch (language) {
    case 'it':
      return 'it-IT';
    case 'es':
      return 'es-419';
    case 'pt':
      return 'pt-BR';
    case 'zh':
      return 'zh-Hans';
    case 'en':
    default:
      return DEFAULT_LOCALE;
  }
};

const loadLocaleCopy = (locale: LocaleCode): Promise<GameCopy> => {
  const cached = localeCache.get(locale);
  if (cached) return cached;

  const promise = localeLoaders[locale]()
    .then((module) => ({
      ...DEFAULT_GAME_COPY,
      ...module.default
    }))
    .catch(() => DEFAULT_GAME_COPY);

  localeCache.set(locale, promise);
  return promise;
};

export const getDefaultGameCopy = (): GameCopy => DEFAULT_GAME_COPY;

export const loadGameCopy = async (locale: string = DEFAULT_LOCALE): Promise<LoadedGameCopy> => {
  const normalizedLocale = normalizeLocale(locale);
  const copy = await loadLocaleCopy(normalizedLocale);

  return {
    locale: normalizedLocale,
    copy
  };
};
