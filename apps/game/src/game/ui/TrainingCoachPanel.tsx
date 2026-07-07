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
}

export default function TrainingCoachPanel({
  move,
  family,
  progress,
  feedback,
  compact,
  learning,
  onLearningChange
}: TrainingCoachPanelProps) {
  const [expanded, setExpanded] = useState(() => !compact);

  useEffect(() => {
    setExpanded(!compact);
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
          {move && family ? (
            <>
              <p>{move.durationBeats} beats · {family} · {move.skills.join(' · ')}</p>
              <div className="game-training-learn__input" aria-label={`Main button: ${mainButton}`}>
                <span aria-hidden="true">{mainButton}</span>
                <div><small>Main button</small><strong>{family}</strong></div>
              </div>
              <div className="game-training-learn__focus">
                <small>Stick sequence</small>
                <p>Follow both guides together: left stick for torso and shoulders, right stick for hips and legs.</p>
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
          <small>{move ? `${progressPercent}% · ${move.durationBeats} beats` : 'A / B / X / Y'}</small>
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
      <div className="game-training-coach__progress" aria-hidden="true">
        <i style={{ width: `${progressPercent}%` }} />
      </div>
      {expanded ? (
        <div className="game-training-coach__details" id="game-training-coach-details">
          {move && family ? (
            <dl>
              <div><dt>Button</dt><dd>{mainButton} · {family}</dd></div>
              <div><dt>Skills</dt><dd>{move.skills.join(', ')}</dd></div>
              <div><dt>Sticks</dt><dd>Left: upper body · Right: lower body</dd></div>
              {feedback ? <div><dt>Feedback</dt><dd>{feedback}</dd></div> : null}
            </dl>
          ) : <p>Choose A Toprock, B Footwork, X Freeze, or Y Powermove.</p>}
        </div>
      ) : null}
    </aside>
  );
}
