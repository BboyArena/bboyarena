import { memo } from 'react';
import type { GameCopy } from '../copy';

function TrainingContextMenuOverlay({
  copy,
  diagnosticsVisible,
  isOpen,
  showDiagnosticsAction,
  onClose,
  onStartTutorial,
  onToggleDiagnostics
}: {
  copy: GameCopy;
  diagnosticsVisible: boolean;
  isOpen: boolean;
  showDiagnosticsAction: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
  onToggleDiagnostics: () => void;
}) {
  if (!isOpen) return null;

  return (
    <aside className="training-context-menu" role="dialog" aria-modal="false" aria-labelledby="training-context-menu-title">
      <span className="training-context-menu__eyebrow">{copy.options}</span>
      <strong id="training-context-menu-title">{copy.trainingPlayTitle}</strong>
      <div className="training-context-menu__actions">
        {showDiagnosticsAction ? (
          <button type="button" aria-pressed={diagnosticsVisible} onClick={onToggleDiagnostics}>
            Debug HUD {diagnosticsVisible ? 'On' : 'Off'}
          </button>
        ) : null}
        <button type="button" onClick={onStartTutorial}>
          {copy.tutorialButton}
        </button>
        <button type="button" className="training-context-menu__close" onClick={onClose}>
          Close
        </button>
      </div>
    </aside>
  );
}

export default memo(TrainingContextMenuOverlay);
