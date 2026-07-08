import type { GameInputSnapshot } from '../input/gameInputTypes';
import type { ActiveMoveQueueEntry } from './MoveQueueController';
import { moveCatalog } from './moveCatalog';
import { sampleStickCueStep } from './stickCueTracks';

export const MINIMUM_MOVE_SCORE = 20;
export const MAXIMUM_MOVE_SCORE = 100;
export const MAXIMUM_STAMINA_REWARD = 6;

export type MoveScoringConfig = {
  toleranceMultiplier: number;
  timingWindowBeats: number;
};

export const scoreToStaminaReward = (score: number) => (
  Math.max(0, Math.min(1, score / MAXIMUM_MOVE_SCORE))
  * MAXIMUM_STAMINA_REWARD
);

export const sampleMoveInputAccuracy = (
  activeMove: ActiveMoveQueueEntry,
  beat: number,
  input: Pick<GameInputSnapshot, 'move' | 'look'>,
  config: MoveScoringConfig = { toleranceMultiplier: 1, timingWindowBeats: 0.2 }
): number | null => {
  const definition = moveCatalog.moves.find((move) => move.intentId === activeMove.intentId);
  if (!definition?.stickCueTracks?.length) return null;

  const progress = activeMove.durationBeats > 0
    ? (beat - activeMove.startedAtBeat) / activeMove.durationBeats
    : 0;
  const samples = definition.stickCueTracks.flatMap((track) => {
    const target = sampleStickCueStep(track, progress, activeMove.durationBeats, config.timingWindowBeats);
    if (!target.active) return [];
    const actual = (track.targetInput ?? 'movement') === 'look' ? input.look : input.move;
    const distance = Math.hypot(actual.x - target.x, actual.y - target.y);
    const tolerance = Math.max(0.01, target.tolerance * config.toleranceMultiplier);
    const normalizedDistance = distance / tolerance;
    return [Math.max(0, 1 - normalizedDistance * normalizedDistance)];
  });

  if (samples.length === 0) return null;
  return samples.reduce((sum, accuracy) => sum + accuracy, 0) / samples.length;
};

export const accuracyToMoveScore = (accuracy: number) => Math.round(
  MINIMUM_MOVE_SCORE
  + Math.max(0, Math.min(1, accuracy)) * (MAXIMUM_MOVE_SCORE - MINIMUM_MOVE_SCORE)
);
