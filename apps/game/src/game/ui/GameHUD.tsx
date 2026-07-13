import { useState } from 'react';
import { useGameStore, type GamePlayMode, type TrainingAudioMode } from '../state/useGameStore';
import type { GameCopy } from '../copy';
import GameButton from './GameButton';
import GamePanel from './GamePanel';
import GameScrollArea from './GameScrollArea';
import { useConnectedGamepads } from '../input/useConnectedGamepads';
import type { GameInputButtonId } from '../input/gameInputTypes';
import { CAMERA_FEELS, type CameraFeel } from '../camera/cameraFeel';

interface GameHudProps {
  copy: GameCopy;
}

export default function GameHUD({ copy }: GameHudProps) {
  const [selectedSettingsTab, setSelectedSettingsTab] = useState<'audio' | 'display' | 'controls' | 'accessibility'>('controls');
  const logoSrc = `${import.meta.env.BASE_URL}logo-bboyarena.svg`;
  const screen = useGameStore((state) => state.screen);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const preferredInputMode = useGameStore((state) => state.preferredInputMode);
  const activeInputSource = useGameStore((state) => state.activeInputSource);
  const bpm = useGameStore((state) => state.bpm);
  const internalMusicEnabled = useGameStore((state) => state.internalMusicEnabled);
  const trainingAudioMode = useGameStore((state) => state.trainingAudioMode);
  const cameraFeel = useGameStore((state) => state.cameraFeel);
  const difficultyMode = useGameStore((state) => state.difficultyMode);
  const adaptiveSkillRating = useGameStore((state) => state.adaptiveSkillRating);
  const setBpm = useGameStore((state) => state.setBpm);
  const setInternalMusicEnabled = useGameStore((state) => state.setInternalMusicEnabled);
  const setTrainingAudioMode = useGameStore((state) => state.setTrainingAudioMode);
  const setCameraFeel = useGameStore((state) => state.setCameraFeel);
  const setDifficultyMode = useGameStore((state) => state.setDifficultyMode);
  const setPreferredInputMode = useGameStore((state) => state.setPreferredInputMode);
  const selectedGamepadIndex = useGameStore((state) => state.selectedGamepadIndex);
  const keyboardInputMap = useGameStore((state) => state.keyboardInputMap);
  const gamepadInputMap = useGameStore((state) => state.gamepadInputMap);
  const setSelectedGamepadIndex = useGameStore((state) => state.setSelectedGamepadIndex);
  const setKeyboardBinding = useGameStore((state) => state.setKeyboardBinding);
  const setGamepadBinding = useGameStore((state) => state.setGamepadBinding);
  const connectedGamepads = useConnectedGamepads();
  const openMainMenu = useGameStore((state) => state.openMainMenu);
  const openSettings = useGameStore((state) => state.openSettings);
  const openCredits = useGameStore((state) => state.openCredits);
  const openCreator = useGameStore((state) => state.openCreator);
  const openSplash = useGameStore((state) => state.openSplash);
  const startMode = useGameStore((state) => state.startMode);
  const mainMenuItems: Array<{ id: GamePlayMode; label: string; note: string; icon: string }> = [
    { id: 'career', label: copy.storyMode, note: copy.storyModeNote, icon: '✦' },
    { id: 'training', label: copy.training, note: copy.trainingNote, icon: '⌁' }
  ];
  const settingsCards = [
    {
      id: 'audio' as const,
      label: copy.audio,
      title: copy.soundMix,
      description: copy.soundMixDescription,
      meta: copy.fourChannels,
      meter: '48%'
    },
    {
      id: 'display' as const,
      label: copy.display,
      title: copy.visualSetup,
      description: copy.visualSetupDescription,
      meta: copy.screen,
      meter: '76%'
    },
    {
      id: 'controls' as const,
      label: copy.controls,
      title: copy.inputMap,
      description: copy.inputMapDescription,
      meta: copy.input,
      meter: '48%'
    },
    {
      id: 'accessibility' as const,
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
  const inputModes: Array<{ id: typeof preferredInputMode; label: string; note: string }> = [
    { id: 'auto', label: 'Auto', note: 'touch / gamepad / keyboard' },
    { id: 'touch', label: 'Touch', note: 'virtual joystick' },
    { id: 'gamepad', label: 'Gamepad', note: 'controller input' },
    { id: 'keyboardMouse', label: 'Keyboard + Mouse', note: 'fallback input' }
  ];
  const difficultyModes = [
    { id: 'assisted' as const, label: 'Assisted', note: 'Generous tracking windows' },
    { id: 'adaptive' as const, label: 'Adaptive', note: 'Grows with your consistency' },
    { id: 'expert' as const, label: 'Expert', note: 'Authored precision' }
  ];
  const trainingAudioModes: Array<{ id: TrainingAudioMode; label: string; note: string }> = [
    { id: 'internal', label: copy.gameMusic, note: copy.gameMusicNote },
    { id: 'bring-your-music', label: copy.bringYourMusic, note: copy.bringYourMusicNote },
    { id: 'manual', label: copy.manualBpm, note: copy.manualBpmNote }
  ];
  const cameraFeels: Array<{ id: CameraFeel; label: string; note: string }> = CAMERA_FEELS.map((feel) => {
    if (feel === 'fixed') return { id: feel, label: 'Fixed Orbit', note: 'Static turntable view' };
    return { id: feel, label: 'Dynamic', note: 'Cypher / footwork / hype by move' };
  });
  const selectedSettingsCard = settingsCards.find((item) => item.id === selectedSettingsTab) ?? settingsCards[2];
  const inputActions: Array<{ id: GameInputButtonId; label: string }> = [
    { id: 'toprock', label: 'Toprock' },
    { id: 'footwork', label: 'Footwork' },
    { id: 'freeze', label: 'Freeze' },
    { id: 'powermove', label: 'Powermove' },
    { id: 'l1', label: 'L1' },
    { id: 'l2', label: 'L2' },
    { id: 'r1', label: 'R1' },
    { id: 'r2', label: 'R2' },
    { id: 'start', label: 'Options' },
    { id: 'pause', label: 'Esc' }
  ];
  const keyboardOptions = ['Space', 'KeyJ', 'KeyK', 'KeyL', 'KeyQ', 'KeyZ', 'KeyE', 'KeyC', 'Enter', 'Escape', 'ShiftLeft', 'ShiftRight'];

  if (screen === 'splashscreen') {
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

  if (screen === 'mainMenu') {
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

              <button type="button" className="game-mode-button game-mode-button--utility game-mode-button--creator" onClick={openCreator}>
                <span className="game-mode-button__icon" aria-hidden="true">
                  ◉
                </span>
                <span className="game-mode-button__body">
                  <span className="game-mode-button__title">{copy.creatorMode}</span>
                  <span className="game-mode-button__note">{copy.creatorModeNote}</span>
                </span>
                <span className="game-mode-button__arrow" aria-hidden="true">
                  →
                </span>
              </button>

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

  if (screen === 'settings') {
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
                <button
                  key={item.id}
                  type="button"
                  className={`game-panel game-panel--light font-game game-settings-card game-settings-tab ${selectedSettingsTab === item.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedSettingsTab(item.id)}
                  aria-pressed={selectedSettingsTab === item.id}
                >
                  <div className="game-settings-card__top">
                    <p className="game-panel__label">{item.label}</p>
                    <span>{item.meta}</span>
                  </div>
                  <div className="game-panel__title">{item.title}</div>
                  <p className="game-panel__description">{item.description}</p>
                  <div className="game-meter" aria-hidden="true">
                    <span style={{ width: item.meter }} />
                  </div>
                </button>
              ))}
            </div>

            <GamePanel variant="light" overflow="visible" className="game-settings-detail">
              <div className="game-settings-card__top">
                <p className="game-panel__label">{selectedSettingsCard.label}</p>
                <span>{selectedSettingsTab === 'controls' ? activeInputSource : selectedSettingsCard.meta}</span>
              </div>
              <div className="game-panel__title">{selectedSettingsCard.title}</div>
              <p className="game-panel__description">{selectedSettingsCard.description}</p>

              {selectedSettingsTab === 'controls' ? (
                <div className="game-input-mode-card">
                  <p className="game-input-config__heading">Input source</p>
                  <div className="game-input-mode-card__grid" role="group" aria-label={copy.inputMap}>
                    {inputModes.map((mode) => (
                      <GameButton
                        key={mode.id}
                        variant={preferredInputMode === mode.id ? 'primary' : 'secondary'}
                        active={preferredInputMode === mode.id}
                        className="game-input-mode-card__button"
                        onClick={() => setPreferredInputMode(mode.id)}
                      >
                        <span className="game-input-mode-card__button-label">{mode.label}</span>
                        <span className="game-input-mode-card__button-note">{mode.note}</span>
                      </GameButton>
                    ))}
                  </div>

                  <div className="game-input-config">
                    <label className="game-input-config__field">
                      <span>Game controller</span>
                      <select
                        value={selectedGamepadIndex ?? ''}
                        onChange={(event) => setSelectedGamepadIndex(event.target.value === '' ? null : Number(event.target.value))}
                      >
                        <option value="">Automatic selection</option>
                        {connectedGamepads.map((gamepad) => (
                          <option key={gamepad.index} value={gamepad.index}>
                            {gamepad.id || `Gamepad ${gamepad.index + 1}`}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="game-input-config__status">
                      {connectedGamepads.length > 0
                        ? `${connectedGamepads.length} controller connected`
                        : 'No game controller detected. Press a button after connecting it.'}
                    </p>

                    <p className="game-input-config__heading">Input map</p>
                    <div className="game-input-map">
                      {inputActions.map((action) => (
                        <div className="game-input-map__row" key={action.id}>
                          <span>{action.label}</span>
                          <label>
                            <span>Keyboard</span>
                            <select
                              value={keyboardInputMap[action.id]}
                              onChange={(event) => setKeyboardBinding(action.id, event.target.value)}
                            >
                              {keyboardOptions.map((code) => <option key={code} value={code}>{code}</option>)}
                            </select>
                          </label>
                          <label>
                            <span>Gamepad</span>
                            <select
                              value={gamepadInputMap[action.id]}
                              onChange={(event) => setGamepadBinding(action.id, Number(event.target.value))}
                            >
                              {Array.from({ length: 16 }, (_, index) => (
                                <option key={index} value={index}>Button {index}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : selectedSettingsTab === 'accessibility' ? (
                <div className="game-input-mode-card">
                  <p className="game-input-config__heading">Training difficulty</p>
                  <div className="game-input-mode-card__grid" role="group" aria-label="Training difficulty">
                    {difficultyModes.map((mode) => (
                      <GameButton
                        key={mode.id}
                        variant={difficultyMode === mode.id ? 'primary' : 'secondary'}
                        active={difficultyMode === mode.id}
                        className="game-input-mode-card__button"
                        onClick={() => setDifficultyMode(mode.id)}
                      >
                        <span className="game-input-mode-card__button-label">{mode.label}</span>
                        <span className="game-input-mode-card__button-note">{mode.note}</span>
                      </GameButton>
                    ))}
                  </div>
                  <p className="game-input-config__status">
                    Adaptive level: {Math.round(adaptiveSkillRating * 100)}%. It changes slowly after each completed move.
                  </p>
                </div>
              ) : selectedSettingsTab === 'audio' ? (
                <div className="game-input-config">
                  <div className="game-audio-setting-row">
                    <div>
                      <p className="game-input-config__heading">{copy.internalMusic}</p>
                      <p className="game-input-config__status">{copy.internalMusicDescription}</p>
                    </div>
                    <GameButton
                      variant={internalMusicEnabled ? 'primary' : 'secondary'}
                      active={internalMusicEnabled}
                      onClick={() => setInternalMusicEnabled(!internalMusicEnabled)}
                      aria-pressed={internalMusicEnabled}
                    >
                      {internalMusicEnabled ? copy.soundOn : copy.soundOff}
                    </GameButton>
                  </div>

                  <p className="game-input-config__heading">{copy.trainingRhythmSource}</p>
                  <div className="game-input-mode-card__grid" role="group" aria-label={copy.trainingRhythmSource}>
                    {trainingAudioModes.map((mode) => (
                      <GameButton
                        key={mode.id}
                        variant={trainingAudioMode === mode.id ? 'primary' : 'secondary'}
                        active={trainingAudioMode === mode.id}
                        className="game-input-mode-card__button"
                        onClick={() => setTrainingAudioMode(mode.id)}
                      >
                        <span className="game-input-mode-card__button-label">{mode.label}</span>
                        <span className="game-input-mode-card__button-note">{mode.note}</span>
                      </GameButton>
                    ))}
                  </div>

                  {trainingAudioMode === 'bring-your-music' ? (
                    <div className="game-audio-capture">
                      <p className="game-input-config__heading">{copy.tapBpm}</p>
                      <p className="game-input-config__status">{copy.bringYourMusicInstructions}</p>
                    </div>
                  ) : (
                    <>
                      <label className="game-input-config__field">
                        <span>Tempo: {bpm} BPM</span>
                        <input
                          type="range"
                          min="60"
                          max="180"
                          step="1"
                          value={bpm}
                          onChange={(event) => setBpm(Number(event.target.value))}
                        />
                      </label>
                      <p className="game-input-config__status">
                        Changes apply immediately to the musical clock and future move timing.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="game-input-mode-card">
                  <p className="game-input-config__heading">Camera Feel</p>
                  <div className="game-input-mode-card__grid" role="group" aria-label="Camera Feel">
                    {cameraFeels.map((feel) => (
                      <GameButton
                        key={feel.id}
                        variant={cameraFeel === feel.id ? 'primary' : 'secondary'}
                        active={cameraFeel === feel.id}
                        className="game-input-mode-card__button"
                        onClick={() => setCameraFeel(feel.id)}
                      >
                        <span className="game-input-mode-card__button-label">{feel.label}</span>
                        <span className="game-input-mode-card__button-note">{feel.note}</span>
                      </GameButton>
                    ))}
                  </div>
                  <p className="game-input-config__status">
                    Camera Feel only changes runtime framing in play scenes. It does not affect input, timing, scoring, or physics.
                  </p>
                </div>
              )}
            </GamePanel>
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

  if (screen === 'credits') {
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
