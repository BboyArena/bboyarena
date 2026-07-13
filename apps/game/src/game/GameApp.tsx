import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './state/useGameStore';
import GameFullscreenToggle from './ui/GameFullscreenToggle';
import GameFullscreenReticle from './ui/GameFullscreenReticle';
import GameHUD from './ui/GameHUD';
import GamePlayScene from './GamePlayScene';
import CreatorMode from './creator/CreatorMode';
import { getDefaultGameCopy, loadGameCopy, type GameCopy, type LocaleCode } from './copy';
import { RhythmClockProvider } from './rhythm/RhythmClockProvider';
import { useHasTouchControls } from './input/useHasTouchControls';
import GameMusic from './audio/GameMusic';
import ManualMetronome from './audio/ManualMetronome';
import './game.css';

interface GameAppProps {
  locale?: LocaleCode | string;
  enableCreatorMode?: boolean;
}

export default function GameApp({ locale = 'en-US', enableCreatorMode = true }: GameAppProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasTouchControls = useHasTouchControls();
  const [copy, setCopy] = useState<GameCopy>(() => getDefaultGameCopy());
  const [resolvedLocale, setResolvedLocale] = useState<LocaleCode>('en-US');
  const screen = useGameStore((state) => state.screen);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const trainingAudioMode = useGameStore((state) => state.trainingAudioMode);
  const openMainMenu = useGameStore((state) => state.openMainMenu);
  const isPlayableScreen = screen === 'career' || screen === 'training';

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const syncViewportHeight = () => {
      root.style.setProperty('--game-viewport-height', `${window.innerHeight}px`);
    };

    syncViewportHeight();
    window.addEventListener('resize', syncViewportHeight);

    return () => window.removeEventListener('resize', syncViewportHeight);
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadGameCopy(locale).then((loadedCopy) => {
      if (!isMounted) return;
      setCopy(loadedCopy.copy);
      setResolvedLocale(loadedCopy.locale);
    });

    return () => {
      isMounted = false;
    };
  }, [locale]);

  useEffect(() => {
    if (!enableCreatorMode && screen === 'creator') {
      openMainMenu();
    }
  }, [enableCreatorMode, openMainMenu, screen]);

  return (
    <RhythmClockProvider>
       <div
        id="bboyarena-game-root"
        className="bboy-game-root"
        ref={rootRef}
        data-has-touchscreen={hasTouchControls ? 'true' : 'false'}
      >
        <div className="game-shell">
          <div className="game-stage" data-scene={screen}>
            {isPlayableScreen ? (
              <>
                <GameMusic />
                {selectedMode === 'training' && trainingAudioMode === 'manual' ? <ManualMetronome /> : null}
                <GamePlayScene mode={selectedMode} copy={copy} />
              </>
            ) : screen === 'creator' && enableCreatorMode ? (
              <CreatorMode copy={copy} />
            ) : (
              <GameHUD copy={copy} enableCreatorMode={enableCreatorMode} />
            )}
            <GameFullscreenToggle targetRef={rootRef} />
            <GameFullscreenReticle targetRef={rootRef} />
          </div>
        </div>
       </div>
    </RhythmClockProvider>
  );
}
