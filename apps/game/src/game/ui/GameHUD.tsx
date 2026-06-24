import { useGameStore, type GamePlayMode } from '../state/useGameStore';
import type { GameCopy } from '../copy';
import GameButton from './GameButton';
import GamePanel from './GamePanel';
import GameScrollArea from './GameScrollArea';

interface GameHudProps {
  copy: GameCopy;
}

export default function GameHUD({ copy }: GameHudProps) {
  const logoSrc = `${import.meta.env.BASE_URL}logo-bboyarena.svg`;
  const scene = useGameStore((state) => state.scene);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const openMainMenu = useGameStore((state) => state.openMainMenu);
  const openSettings = useGameStore((state) => state.openSettings);
  const openCredits = useGameStore((state) => state.openCredits);
  const openSplash = useGameStore((state) => state.openSplash);
  const startMode = useGameStore((state) => state.startMode);
  const mainMenuItems: Array<{ id: GamePlayMode; label: string; note: string; icon: string }> = [
    { id: 'career', label: copy.storyMode, note: copy.storyModeNote, icon: '✦' },
    { id: 'training', label: copy.training, note: copy.trainingNote, icon: '⌁' }
  ];
  const settingsCards = [
    {
      label: copy.audio,
      title: copy.soundMix,
      description: copy.soundMixDescription,
      meta: copy.fourChannels,
      meter: '48%'
    },
    {
      label: copy.display,
      title: copy.visualSetup,
      description: copy.visualSetupDescription,
      meta: copy.screen,
      meter: '76%'
    },
    {
      label: copy.controls,
      title: copy.inputMap,
      description: copy.inputMapDescription,
      meta: copy.input,
      meter: '48%'
    },
    {
      label: copy.accessibility,
      title: copy.assistOptions,
      description: copy.assistOptionsDescription,
      meta: copy.access,
      meter: '62%'
    }
  ];
  const creditCards = [
    {
      label: copy.team,
      title: copy.independentSoloBuild,
      description: copy.independentSoloBuildDescription,
      meta: copy.openDev
    },
    {
      label: copy.tools,
      title: copy.stackTitle,
      description: copy.stackDescription,
      meta: copy.stack
    },
    {
      label: copy.visualDirection,
      title: copy.urbanArcadeBase,
      description: copy.urbanArcadeBaseDescription,
      meta: copy.style
    }
  ];

  if (scene === 'splashscreen') {
    return (
      <div className="game-hud game-hud--splash">
        <div className="game-splash-layout">
          <div className="game-splash-logo-block">
            <img src={logoSrc} alt="BboyArena" className="game-splash-logo-image" />
            <div className="game-splash-kicker">{copy.splashKicker}</div>
          </div>

          <GamePanel variant="dark" className="game-splash-card">
            <p className="game-panel__label">{copy.welcome}</p>
            <div className="game-panel__title">{copy.enterLobby}</div>
            <p className="game-panel__description">{copy.splashDescription}</p>
            <div className="game-splash-actions">
              <GameButton variant="primary" fullWidth onClick={openMainMenu}>
                {copy.continue}
              </GameButton>
            </div>
          </GamePanel>
        </div>
      </div>
    );
  }

  if (scene === 'mainMenu') {
    return (
      <div className="game-hud game-hud--menu">
        <div className="game-mainmenu">
          <div className="game-mainmenu__left">
            <div className="game-mainmenu__brand">
              <img src={logoSrc} alt="BboyArena" className="game-mainmenu__logo-image" />
              <div className="game-mainmenu__subtitle">{copy.mainMenuSubtitle}</div>
            </div>

            <nav className="game-mainmenu__nav" aria-label={copy.gameModes}>
              {mainMenuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`game-mode-button ${selectedMode === item.id ? 'is-primary' : ''}`}
                  onClick={() => startMode(item.id)}
                >
                  <span className="game-mode-button__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="game-mode-button__body">
                    <span className="game-mode-button__title">{item.label}</span>
                    <span className="game-mode-button__note">{item.note}</span>
                  </span>
                  <span className="game-mode-button__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              ))}

              <button type="button" className="game-mode-button game-mode-button--utility" onClick={openSettings}>
                <span className="game-mode-button__icon" aria-hidden="true">
                  ⚙
                </span>
                <span className="game-mode-button__body">
                  <span className="game-mode-button__title">{copy.options}</span>
                  <span className="game-mode-button__note">{copy.optionsNote}</span>
                </span>
                <span className="game-mode-button__arrow" aria-hidden="true">
                  →
                </span>
              </button>

              <button type="button" className="game-mode-button game-mode-button--utility game-mode-button--credits" onClick={openCredits}>
                <span className="game-mode-button__icon" aria-hidden="true">
                  ★
                </span>
                <span className="game-mode-button__body">
                  <span className="game-mode-button__title">{copy.creditsMenuTitle}</span>
                  <span className="game-mode-button__note">{copy.creditsMenuNote}</span>
                </span>
                <span className="game-mode-button__arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </nav>
          </div>

          <div className="game-mainmenu__topbar">
            <GamePanel variant="soft" className="game-profile-card">
              <div className="game-profile-card__avatar" aria-hidden="true" />
              <div className="game-profile-card__body">
                <div className="game-profile-card__name">BBOY_ROOKIE</div>
                <div className="game-profile-card__meta">{copy.levelMeta}</div>
              </div>
            </GamePanel>

            <GamePanel variant="soft" className="game-currency-card">
              <div className="game-currency-card__coin" aria-hidden="true" />
              <div className="game-currency-card__value">865</div>
              <button type="button" className="game-currency-card__plus" aria-label={copy.addCurrency}>
                +
              </button>
            </GamePanel>
          </div>

        </div>
      </div>
    );
  }

  if (scene === 'settings') {
    return (
      <div className="game-hud game-hud--section">
        <GamePanel variant="dark" className="game-section-shell">
          <div className="game-section-shell__header">
            <div>
              <p className="game-panel__label">{copy.settings}</p>
              <div className="game-panel__title">{copy.displayAndInput}</div>
              <p className="game-panel__description">{copy.settingsDescription}</p>
            </div>
            <span className="game-section-shell__tag">{copy.prototypePanel}</span>
          </div>

          <GameScrollArea className="game-section-shell__body">
            <div className="game-settings-grid">
              {settingsCards.map((item) => (
                <GamePanel key={item.label} variant="light" overflow="auto" className="game-settings-card">
                  <div className="game-settings-card__top">
                    <p className="game-panel__label">{item.label}</p>
                    <span>{item.meta}</span>
                  </div>
                  <div className="game-panel__title">{item.title}</div>
                  <p className="game-panel__description">{item.description}</p>
                  <div className="game-meter" aria-hidden="true">
                    <span style={{ width: item.meter }} />
                  </div>
                </GamePanel>
              ))}
            </div>
          </GameScrollArea>

          <div className="game-section-shell__footer">
            <GameButton variant="secondary" onClick={openMainMenu}>
              {copy.backToMenu}
            </GameButton>
            <p>{copy.changesPlaceholder}</p>
          </div>
        </GamePanel>
      </div>
    );
  }

  if (scene === 'credits') {
    return (
      <div className="game-hud game-hud--section">
        <GamePanel variant="dark" className="game-section-shell">
          <div className="game-section-shell__header">
            <div>
              <p className="game-panel__label">{copy.credits}</p>
              <div className="game-panel__title">{copy.projectNotes}</div>
              <p className="game-panel__description">{copy.creditsDescription}</p>
            </div>
            <span className="game-section-shell__tag">{copy.openSource}</span>
          </div>

          <GameScrollArea className="game-section-shell__body">
            <div className="game-credits-grid">
              {creditCards.map((item) => (
                <GamePanel key={item.label} variant="light" overflow="auto" className="game-credits-card">
                  <div className="game-settings-card__top">
                    <p className="game-panel__label">{item.label}</p>
                    <span>{item.meta}</span>
                  </div>
                  <div className="game-panel__title">{item.title}</div>
                  <p className="game-panel__description">{item.description}</p>
                </GamePanel>
              ))}
            </div>
          </GameScrollArea>

          <div className="game-section-shell__footer">
            <GameButton variant="secondary" onClick={openMainMenu}>
              {copy.backToMenu}
            </GameButton>
            <p>{copy.creditsFooter}</p>
          </div>
        </GamePanel>
      </div>
    );
  }
  console.log('GameHUD: unhandled scene', scene);
  return (
    <div className="game-hud game-hud--splash">
      <div className="game-splash-layout">
        <div className="game-splash-logo-block">
          <img src={logoSrc} alt="BboyArena" className="game-splash-logo-image" />
          <div className="game-splash-kicker">{copy.illustratedLobbyNo3d}</div>
        </div>
        <GameButton variant="secondary" onClick={openSplash}>
          {copy.reset}
        </GameButton>
        <p className="game-splash-helper">{copy.selectCrew}</p>
      </div>
    </div>
  );
}
