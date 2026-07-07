import type { GameInputSnapshot } from '../input/gameInputTypes';
import type { ActiveMoveQueueEntry } from './MoveQueueController';
import { moveCatalog } from './moveCatalog';
import { sampleStickCueTrack } from './stickCueTracks';

export const MINIMUM_MOVE_SCORE = 20;
export const MAXIMUM_MOVE_SCORE = 100;
export const MAXIMUM_STAMINA_REWARD = 5;

export const scoreToStaminaReward = (score: number) => (
  Math.max(0, Math.min(1, (score - MINIMUM_MOVE_SCORE) / (MAXIMUM_MOVE_SCORE - MINIMUM_MOVE_SCORE)))
  * MAXIMUM_STAMINA_REWARD
);

export const sampleMoveInputAccuracy = (
  activeMove: ActiveMoveQueueEntry,
  beat: number,
  input: Pick<GameInputSnapshot, 'move' | 'look'>
): number | null => {
  const definition = moveCatalog.moves.find((move) => move.intentId === activeMove.intentId);
  if (!definition?.stickCueTracks?.length) return null;

  const progress = activeMove.durationBeats > 0
    ? (beat - activeMove.startedAtBeat) / activeMove.durationBeats
    : 0;
  const samples = definition.stickCueTracks.map((track) => {
    const target = sampleStickCueTrack(track, progress);
    const actual = (track.targetInput ?? 'movement') === 'look' ? input.look : input.move;
    const distance = Math.hypot(actual.x - target.x, actual.y - target.y);
    return Math.max(0, 1 - (distance / Math.max(0.01, target.tolerance)));
  });

  return samples.reduce((sum, accuracy) => sum + accuracy, 0) / samples.length;
};

export const accuracyToMoveScore = (accuracy: number) => Math.round(
  MINIMUM_MOVE_SCORE
  + Math.max(0, Math.min(1, accuracy)) * (MAXIMUM_MOVE_SCORE - MINIMUM_MOVE_SCORE)
);
