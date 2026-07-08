import { useEffect, useState } from 'react';
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

export default function TrainingCoachPanel({
  move,
  family,
  progress,
  feedback,
  compact,
  learning,
  onLearningChange,
  stamina,
  score,
  loopPoints,
  totalPoints
}: TrainingCoachPanelProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [compact]);

  const progressPercent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const displayName = move?.label ?? 'Choose a move';
  const mainButton = family ? familyButtons[family] : null;

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
    <aside className="game-training-coach" data-expanded={expanded} aria-label="Training coach">
      <div className="game-training-coach__summary">
        <div>
          <span>Current move</span>
          <strong>{displayName}</strong>
          <small>{move && family ? `${mainButton} · ${family}` : 'A / B / X / Y · Choose a move'}</small>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="game-training-coach-details"
          onClick={() => {
            if (compact) onLearningChange(true);
            else setExpanded((value) => !value);
          }}
        >
          <span aria-hidden="true">?</span>
          <b>Coach</b>
        </button>
      </div>
      <div className="game-training-coach__stamina" aria-label={`Stamina ${Math.round(stamina)}%`}>
        <span>Stamina</span><strong>{Math.round(stamina)}%</strong>
        <div><i style={{ width: `${stamina}%` }} /></div>
      </div>
      <div className="game-training-coach__progress" aria-label={`Loop ${progressPercent}% complete`}>
        <span>Loop {progressPercent}%</span>
        <div>
        <i style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
      {expanded ? (
        <div className="game-training-coach__details" id="game-training-coach-details">
          {move && family ? (
            <dl>
              <div><dt>Button</dt><dd>{mainButton} · {family}</dd></div>
              <div><dt>Skills</dt><dd>{move.skills.join(', ')}</dd></div>
              <div><dt>Steps</dt><dd>Hit both gold checkpoints when they become active</dd></div>
              <div><dt>Score</dt><dd>Loop {score ?? 0}% · {loopPoints} pts · Run {totalPoints} pts</dd></div>
              <div><dt>Energy</dt><dd>Stamina {Math.round(stamina)}% · drains during movement, recovers after the loop</dd></div>
              {feedback ? <div><dt>Feedback</dt><dd>{feedback}</dd></div> : null}
            </dl>
          ) : <p>Choose A Toprock, B Footwork, X Freeze, or Y Powermove.</p>}
        </div>
      ) : null}
    </aside>
  );
}
