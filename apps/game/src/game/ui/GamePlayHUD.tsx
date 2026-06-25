import { useEffect, useMemo, useState } from 'react';
import type { GameCopy } from '../copy';
import { useGameStore } from '../state/useGameStore';
import GameButton from './GameButton';
import GamePanel from './GamePanel';

interface GamePlayHudProps {
  gameState: string;
  send: (event: { type: string }) => void;
  onExit: () => void;
  copy: GameCopy;
}

export default function GamePlayHUD({ gameState, send, onExit, copy }: GamePlayHudProps) {
  const {
    selectedCharacter,
    score,
    bpm,
    isMuted,
    incrementScore,
    toggleMute,
    resetGame,
    selectedMode
  } = useGameStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return undefined;

    const interval = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'idle') {
      setElapsedSeconds(0);
    }
  }, [gameState]);

  const handleStart = () => {
    resetGame();
    setElapsedSeconds(0);
    send({ type: 'START' });
  };

  const timerLabel = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [elapsedSeconds]);

  const combo = gameState === 'playing' ? Math.max(1, Math.floor(score / 30) + 1) : Math.max(0, Math.floor(score / 40));
  const stamina = gameState === 'playing' ? Math.max(18, 100 - elapsedSeconds * 3 - Math.floor(score / 8)) : 100;
  const moves = [copy.topRock, copy.freeze, copy.swipe, copy.footwork];
  const activeMove = moves[elapsedSeconds % moves.length];
  return(<></>);
  /*return (
    <div className="game-hud game-hud--play">
      <div className="game-hud__top">
        <GamePanel variant="light" className="game-play-banner">
          <p className="game-panel__label">{copy.playScene}</p>
          <div className="game-panel__title">{selectedMode === 'career' ? copy.storyModePlayTitle : copy.trainingPlayTitle}</div>
          <p className="game-panel__description">{copy.playSceneDescription}</p>
        </GamePanel>
      </div>

      <div className="game-hud__top game-hud__top--compact">
        <GamePanel variant="light">
          <div>
            <p className="game-panel__label">{copy.crewStatus}</p>
            <div className="game-score-grid" style={{ marginTop: '0.75rem' }}>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                  <div className="game-badge" style={{ color: gameState === 'playing' ? '#7f9740' : gameState === 'paused' ? '#c56a41' : '#857463' }}>
                    {gameState}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="game-score-label">{copy.score}</p>
                  <div className="game-score-value">{String(score).padStart(5, '0')}</div>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }} className="game-divider" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <div>
                  <p className="game-score-label">{copy.selectedCrew}</p>
                  <div className="game-badge" style={{ marginTop: '0.5rem' }}>
                    {selectedCharacter}
                  </div>
                </div>
                <div style={{ width: '8.5rem' }}>
                  <div className="game-score-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>{copy.stamina}</span>
                    <span>{stamina}%</span>
                  </div>
                  <div className="game-score-meter">
                    <div className="game-score-meter__fill" style={{ width: `${stamina}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GamePanel>

        <GamePanel variant="dark" className="game-timer">
          <p className="game-panel__label">{copy.timer}</p>
          <div className="game-timer__value">{timerLabel}</div>
          <div className="game-timer__meta">
            {copy.round} / {gameState}
          </div>
          <div className="game-score-grid">
            <div className="game-score-card">
              <p className="game-score-label">BPM</p>
              <div className="game-score-value">{bpm}</div>
            </div>
            <div className="game-score-card">
              <p className="game-score-label">Combo</p>
              <div className="game-score-value">x{combo}</div>
            </div>
          </div>
        </GamePanel>

        <GamePanel variant="light">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ minWidth: 0 }}>
              <p className="game-panel__label">{copy.moveList}</p>
              <ul style={{ margin: '0.75rem 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: '0.4rem' }}>
                {moves.map((move, index) => (
                  <li
                    key={move}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: move === activeMove ? '#8a9d4a' : '#5f5346'
                    }}
                  >
                    {index + 1}. {move}
                  </li>
                ))}
              </ul>
            </div>

            <GameButton variant="ghost" onClick={toggleMute}>
              {isMuted ? copy.soundOff : copy.soundOn}
            </GameButton>
          </div>
        </GamePanel>
      </div>

      <div className="game-hud__center">
        <GameButton variant="primary" className="game-battle-button" onClick={() => incrementScore(10)}>
          {copy.tapForScore}
        </GameButton>
      </div>

      <div className="game-hud__bottom">
        {gameState === 'idle' || gameState === 'gameOver' ? (
          <>
            <GameButton variant="primary" onClick={handleStart}>
              {copy.startRound}
            </GameButton>
            <GameButton variant="secondary" onClick={onExit}>
              {copy.backToMenu}
            </GameButton>
          </>
        ) : gameState === 'playing' ? (
          <>
            <GameButton variant="secondary" onClick={() => send({ type: 'PAUSE' })}>
              {copy.pause}
            </GameButton>
            <GameButton variant="warm" onClick={() => send({ type: 'GAME_OVER' })}>
              {copy.finishRound}
            </GameButton>
            <GameButton variant="ghost" onClick={onExit}>
              {copy.backToMenu}
            </GameButton>
          </>
        ) : (
          <>
            <GameButton variant="primary" onClick={() => send({ type: 'RESUME' })}>
              {copy.resume}
            </GameButton>
            <GameButton variant="secondary" onClick={() => send({ type: 'RESET' })}>
              {copy.reset}
            </GameButton>
            <GameButton variant="ghost" onClick={onExit}>
              {copy.backToMenu}
            </GameButton>
          </>
        )}
      </div>
    </div>
  );*/
}
