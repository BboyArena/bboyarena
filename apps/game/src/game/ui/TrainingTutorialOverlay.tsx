import { memo } from 'react';
import type { GameCopy } from '../copy';
import type { LeftStickTutorialChallenge, TrainingTutorialState, TrainingTutorialStepId } from '../training/useTrainingTutorial';

const stepCopyKey: Record<Exclude<TrainingTutorialStepId, 'completed'>, keyof GameCopy> = {
  welcome: 'tutorialWelcome',
  leftStick: 'tutorialLeftStick',
  rightStick: 'tutorialRightStick',
  pressA: 'tutorialPressA',
  pressX: 'tutorialPressX',
  freePractice: 'tutorialFreePractice'
};

function TrainingTutorialOverlay({
  tutorial,
  copy,
  onAdvance,
  onSkip,
  leftStickChallenge
}: {
  tutorial: TrainingTutorialState;
  copy: GameCopy;
  onAdvance: () => void;
  onSkip: () => void;
  leftStickChallenge: LeftStickTutorialChallenge | null;
}) {
  if (!tutorial.isActive || tutorial.currentStep === 'completed') return null;

  const canAdvance = tutorial.currentStep === 'welcome' || tutorial.currentStep === 'freePractice';

  return (
    <aside className="training-tutorial" data-step={tutorial.currentStep} aria-live="polite">
      <span className="training-tutorial__eyebrow">{copy.tutorialTitle}</span>
      <strong>{copy[stepCopyKey[tutorial.currentStep]]}</strong>
      {tutorial.currentStep === 'leftStick' && leftStickChallenge ? (
        <div className="training-tutorial__stick-challenge">
          <span className="training-tutorial__stick-map" aria-label={`Target ${leftStickChallenge.position} of ${leftStickChallenge.totalPositions}`}>
            <i style={{ left: `${50 + leftStickChallenge.target.x * 42}%`, top: `${50 - leftStickChallenge.target.y * 42}%` }} />
          </span>
          <span>
            <b>{leftStickChallenge.position}/{leftStickChallenge.totalPositions}</b>
            <small>{leftStickChallenge.waitingForBeat ? 'LOCKED · NEXT BEAT' : `${leftStickChallenge.score}% · NEED 85%`}</small>
          </span>
        </div>
      ) : null}
      <div className="training-tutorial__actions">
        {canAdvance ? (
          <button type="button" onClick={onAdvance}>
            {tutorial.currentStep === 'welcome' ? copy.tutorialStart : copy.tutorialFinish}
          </button>
        ) : <small>{copy.tutorialTryIt}</small>}
        <button type="button" className="training-tutorial__skip" onClick={onSkip}>{copy.tutorialSkip}</button>
      </div>
    </aside>
  );
}

export default memo(TrainingTutorialOverlay);
