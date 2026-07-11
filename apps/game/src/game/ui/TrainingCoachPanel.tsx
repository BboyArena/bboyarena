import { memo, type CSSProperties } from 'react';
import type { MoveDefinition, MoveFamilyId } from '../move/moveDefinitionTypes';

const familyButtons: Record<MoveFamilyId, string> = {
  toprock: 'A',
  footwork: 'B',
  freeze: 'X',
  powermove: 'Y'
};

interface TrainingCoachPanelProps {
  move: MoveDefinition | null;
  family: MoveFamilyId | null;
  progress: number;
  feedback?: string;
  compact: boolean;
  learning: boolean;
  onLearningChange: (learning: boolean) => void;
  stamina: number;
  score: number | null;
  loopPoints: number;
  totalPoints: number;
}

function TrainingCoachPanel({
  move,
  family,
  progress,
  learning,
  onLearningChange,
  stamina,
  score,
}: TrainingCoachPanelProps) {
  const progressPercent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const displayName = move?.label ?? 'Choose a move';
  const mainButton = family ? familyButtons[family] : null;
  const staminaLevel = Math.min(1, Math.max(0, stamina / 100));
  const staminaSaturation = Math.min(1, Math.max(0, (stamina - 5) / 95));

  if (learning) {
    return (
      <section className="game-training-learn" aria-label={`${displayName} game tutorial`}>
        <div className="game-training-learn__card">
          <span className="game-training-learn__eyebrow">Prototype move catalog</span>
          <h2>{displayName}</h2>
          <div className="game-training-learn__performance">
            <div><small>Loop score</small><strong>{score ?? 0}%</strong></div>
            <div><small>Stamina</small><strong>{Math.round(stamina)}%</strong></div>
          </div>
          {move && family ? (
            <>
              <p>{move.durationBeats} beats · {family} · {move.skills.join(' · ')}</p>
              <div className="game-training-learn__input" aria-label={`Main button: ${mainButton}`}>
                <span aria-hidden="true">{mainButton}</span>
                <div><small>Main button</small><strong>{family}</strong></div>
              </div>
              <div className="game-training-learn__focus">
                <small>Stick sequence</small>
                <p>Hit the gold checkpoints on the beat. Movement between steps is free.</p>
              </div>
            </>
          ) : (
            <>
              <p>Select one of the four move families to begin practice.</p>
              <div className="game-training-learn__families" aria-label="Move family buttons">
                {(Object.entries(familyButtons) as Array<[MoveFamilyId, string]>).map(([moveFamily, button]) => (
                  <div key={moveFamily}><b>{button}</b><span>{moveFamily}</span></div>
                ))}
              </div>
              <div className="game-training-learn__focus">
                <small>Two-stick grammar</small>
                <p>Left controls torso and shoulders. Right controls hips and legs.</p>
              </div>
            </>
          )}
          <button type="button" onClick={() => onLearningChange(false)}>Open practice</button>
          <small className="game-training-learn__note">Game inputs only — not physical breaking instruction.</small>
        </div>
      </section>
    );
  }

  return (
    <aside
      className="game-training-coach"
      data-compact="true"
      data-expanded="false"
      aria-label="Training coach"
      style={{
        '--training-stamina-level': staminaLevel,
        '--training-stamina-saturation': staminaSaturation,
        '--training-loop-progress': progressPercent / 100
      } as CSSProperties}
    >
      <div className="game-training-coach__summary">
        <div>
          <strong>{displayName}</strong>
        </div>
      </div>
      <div className="game-training-coach__stamina" aria-label={`Stamina ${Math.round(stamina)}%`}>
        <div><i /></div>
      </div>
      <div className="game-training-coach__progress" aria-label={`Loop ${progressPercent}% complete`}>
        <div>
        <i />
        </div>
      </div>
    </aside>
  );
}

export default memo(TrainingCoachPanel);
