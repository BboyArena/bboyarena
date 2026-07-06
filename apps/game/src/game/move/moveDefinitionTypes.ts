import type { GameInputAction } from '../input/gameInputTypes';
import type { PlayerMotionIntentId } from '../motion/playerMotionTypes';

export type MovePhaseDefinition = {
  id: string;
  startFrame: number;
  endFrame: number;
};

export type MoveCueDefinition = {
  id: string;
  phaseId: string;
  action: GameInputAction;
  sourceFrame: number;
  earlyWindowFrames: number;
  lateWindowFrames: number;
  weight: number;
};

export type MoveTransitionDefinition = {
  intentId: PlayerMotionIntentId;
  windowStartFrame: number;
  windowEndFrame: number;
};

export type MoveDefinition = {
  id: string;
  version: number;
  intentId: PlayerMotionIntentId;
  label: string;
  skills: string[];
  sourceFps: number;
  sourceFrameCount: number;
  durationBeats: number;
  loop: {
    startFrame: number;
    endFrame: number;
  } | null;
  phases: MovePhaseDefinition[];
  cues: MoveCueDefinition[];
  transitions: MoveTransitionDefinition[];
};

export type MoveDefinitionCatalog = {
  version: 1;
  catalogId: string;
  catalogRevision: string;
  moves: MoveDefinition[];
};

export type NormalizedMoveCue = MoveCueDefinition & {
  targetBeat: number;
  targetTickOffset: number;
  earlyWindowTicks: number;
  lateWindowTicks: number;
};

export type NormalizedMoveDefinition = MoveDefinition & {
  runtimeBpm: number;
  tickRate: number;
  durationSeconds: number;
  durationTicks: number;
  authoredDurationSeconds: number;
  animationTimeScale: number;
  loopBeats: { start: number; end: number } | null;
  loopTicks: { start: number; end: number } | null;
  normalizedCues: NormalizedMoveCue[];
  normalizedTransitions: Array<MoveTransitionDefinition & {
    windowStartBeat: number;
    windowEndBeat: number;
    windowStartTick: number;
    windowEndTick: number;
  }>;
};
