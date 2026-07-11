import { memo, type CSSProperties } from 'react';
import type { MoveDefinition } from '../move/moveDefinitionTypes';

interface TrainingCoachPanelProps {
  move: MoveDefinition | null;
  progress: number;
  stamina: number;
}

function TrainingCoachPanel({
  move,
  progress,
  stamina,
}: TrainingCoachPanelProps) {
  const progressPercent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const displayName = move?.label ?? 'Choose a move';
  const staminaLevel = Math.min(1, Math.max(0, stamina / 100));
  const staminaSaturation = Math.min(1, Math.max(0, (stamina - 5) / 95));

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
