import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameInputSnapshot } from '../input/gameInputTypes';
import type { RhythmClockSnapshot } from '../rhythm/RhythmClock';

export type TrainingTutorialStepId =
  | 'welcome'
  | 'leftStick'
  | 'rightStick'
  | 'pressA'
  | 'pressX'
  | 'freePractice'
  | 'completed';

export type TrainingTutorialState = {
  isActive: boolean;
  isCompleted: boolean;
  currentStep: TrainingTutorialStepId;
};

export type LeftStickTutorialChallenge = {
  target: { x: number; y: number };
  position: number;
  totalPositions: number;
  score: number;
  waitingForBeat: boolean;
};

const TUTORIAL_SEEN_KEY = 'bboyarena-training-tutorial-seen';
const STICK_ACTIVATION_THRESHOLD = 0.5;
const LEFT_STICK_TARGET_COUNT = 6;
const LEFT_STICK_PASS_SCORE = 85;
const LEFT_STICK_SCORE_STEP = 5;
const LEFT_STICK_DIRECTIONS = [
  { x: 0, y: 0.85 },
  { x: 0.6, y: 0.6 },
  { x: 0.85, y: 0 },
  { x: 0.6, y: -0.6 },
  { x: 0, y: -0.85 },
  { x: -0.6, y: -0.6 },
  { x: -0.85, y: 0 },
  { x: -0.6, y: 0.6 }
] as const;

function createRandomTarget(previous?: { x: number; y: number }) {
  const candidates = previous
    ? LEFT_STICK_DIRECTIONS.filter((direction) => direction.x !== previous.x || direction.y !== previous.y)
    : LEFT_STICK_DIRECTIONS;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function scoreStickPosition(input: { x: number; y: number }, target: { x: number; y: number }) {
  const distance = Math.hypot(input.x - target.x, input.y - target.y);
  return Math.round(Math.max(0, Math.min(100, (1 - distance / 2) * 100)));
}

const nextStep: Record<Exclude<TrainingTutorialStepId, 'completed'>, TrainingTutorialStepId> = {
  welcome: 'leftStick',
  leftStick: 'rightStick',
  rightStick: 'pressA',
  pressA: 'pressX',
  pressX: 'freePractice',
  freePractice: 'completed'
};

function hasSeenTutorial() {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(TUTORIAL_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberTutorial() {
  try {
    window.localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
  } catch {
    // Storage can be unavailable in privacy modes; the tutorial still works for this session.
  }
}

export function useTrainingTutorial(
  enabled: boolean,
  rhythm: RhythmClockSnapshot,
  snapshot: GameInputSnapshot
) {
  const previousSnapshotRef = useRef(snapshot);
  const latestSnapshotRef = useRef(snapshot);
  latestSnapshotRef.current = snapshot;
  const acceptedAtBeatRef = useRef<number | null>(null);
  const [leftStickChallenge, setLeftStickChallenge] = useState<LeftStickTutorialChallenge | null>(null);
  const [state, setState] = useState<TrainingTutorialState>(() => {
    const shouldStart = enabled && !hasSeenTutorial();
    return {
      isActive: shouldStart,
      isCompleted: false,
      currentStep: shouldStart ? 'welcome' : 'completed'
    };
  });

  const start = useCallback(() => {
    previousSnapshotRef.current = latestSnapshotRef.current;
    setState({ isActive: true, isCompleted: false, currentStep: 'welcome' });
    setLeftStickChallenge(null);
  }, []);

  const skip = useCallback(() => {
    rememberTutorial();
    setState((current) => ({ ...current, isActive: false, currentStep: 'completed' }));
    setLeftStickChallenge(null);
  }, []);

  const advance = useCallback(() => {
    setState((current) => {
      if (!current.isActive || current.currentStep === 'completed') return current;
      const currentStep = nextStep[current.currentStep];
      if (currentStep === 'completed') {
        rememberTutorial();
        return { isActive: false, isCompleted: true, currentStep };
      }
      return { ...current, currentStep };
    });
  }, []);

  useEffect(() => {
    if (enabled) return;

    acceptedAtBeatRef.current = null;
    setLeftStickChallenge(null);
    setState((current) => current.isActive
      ? { isActive: false, isCompleted: current.isCompleted, currentStep: 'completed' }
      : current
    );
  }, [enabled]);

  useEffect(() => {
    if (!state.isActive || state.currentStep !== 'leftStick') {
      setLeftStickChallenge(null);
      acceptedAtBeatRef.current = null;
      return;
    }

    setLeftStickChallenge((current) => current ?? {
      target: createRandomTarget(),
      position: 1,
      totalPositions: LEFT_STICK_TARGET_COUNT,
      score: 0,
      waitingForBeat: false
    });
  }, [state.currentStep, state.isActive]);

  useEffect(() => {
    if (!leftStickChallenge || state.currentStep !== 'leftStick' || !state.isActive) return;

    const score = scoreStickPosition(snapshot.move, leftStickChallenge.target);
    const displayScore = score >= LEFT_STICK_PASS_SCORE
      ? score
      : Math.floor(score / LEFT_STICK_SCORE_STEP) * LEFT_STICK_SCORE_STEP;
    if (displayScore !== leftStickChallenge.score) {
      setLeftStickChallenge((current) => current ? { ...current, score: displayScore } : current);
    }
    if (score < LEFT_STICK_PASS_SCORE) return;

    if (leftStickChallenge.position >= LEFT_STICK_TARGET_COUNT) {
      advance();
      return;
    }

    acceptedAtBeatRef.current = null;
    setLeftStickChallenge((current) => current ? {
      ...current,
      target: createRandomTarget(current.target),
      position: current.position + 1,
      score: 0,
      waitingForBeat: false
    } : current);
  }, [advance, leftStickChallenge, rhythm.tick, snapshot.move, state.currentStep, state.isActive]);

  useEffect(() => {
    const previous = previousSnapshotRef.current;
    previousSnapshotRef.current = snapshot;
    if (!enabled || !state.isActive) return;

    const movedRight = Math.hypot(snapshot.look.x, snapshot.look.y) >= STICK_ACTIVATION_THRESHOLD
      && Math.hypot(previous.look.x, previous.look.y) < STICK_ACTIVATION_THRESHOLD;
    const pressedA = snapshot.buttons.toprock.pressed && !previous.buttons.toprock.pressed;
    const pressedX = snapshot.buttons.freeze.pressed && !previous.buttons.freeze.pressed;

    if (
      (state.currentStep === 'rightStick' && movedRight)
      || (state.currentStep === 'pressA' && pressedA)
      || (state.currentStep === 'pressX' && pressedX)
    ) {
      advance();
    }
  }, [advance, enabled, snapshot, state.currentStep, state.isActive]);

  return { state, leftStickChallenge, start, skip, advance };
}
