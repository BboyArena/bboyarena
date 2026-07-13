import type { GameInputButtonId } from '../input/gameInputTypes';

export type CreatorTimingFeedback = 'perfect' | 'good' | 'miss';

export type CreatorCameraStatus =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'denied'
  | 'unavailable'
  | 'error';

export type CreatorFacingMode = 'user' | 'environment';

export type CreatorRecorderStatus =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'stopping'
  | 'ready'
  | 'unsupported'
  | 'error';

export type CreatorVideoFilterId = 'clean' | 'warm' | 'cool' | 'highContrast' | 'mono';

export type CreatorVideoFilter = {
  id: CreatorVideoFilterId;
  label: string;
  cssFilter: string;
};

export const creatorVideoFilters: CreatorVideoFilter[] = [
  { id: 'clean', label: 'Clean', cssFilter: 'none' },
  { id: 'warm', label: 'Warm', cssFilter: 'saturate(1.08) contrast(1.04) sepia(0.16)' },
  { id: 'cool', label: 'Cool', cssFilter: 'saturate(1.04) contrast(1.05) hue-rotate(8deg)' },
  { id: 'highContrast', label: 'Punch', cssFilter: 'contrast(1.18) saturate(1.12)' },
  { id: 'mono', label: 'Mono', cssFilter: 'grayscale(1) contrast(1.12)' }
];

export type CreatorStickSnapshot = {
  x: number;
  y: number;
  active: boolean;
};

export type CreatorHudSnapshot = {
  leftStick: CreatorStickSnapshot;
  rightStick: CreatorStickSnapshot;
  pressedButtons: GameInputButtonId[];
  bpm: number;
  score: number;
  combo: number;
  moveName: string | null;
  timingFeedback: CreatorTimingFeedback | null;
  elapsedMs: number;
  recording: boolean;
};

export const creatorMoveLabels: Partial<Record<GameInputButtonId, string>> = {
  toprock: 'Toprock',
  footwork: 'Footwork',
  freeze: 'Freeze',
  powermove: 'Powermove',
  l1: 'Style switch',
  l2: 'Drop low',
  r1: 'Hype hit',
  r2: 'Beat cut'
};

export const creatorButtonLabels: Record<GameInputButtonId, string> = {
  toprock: 'A',
  footwork: 'B',
  freeze: 'X',
  powermove: 'Y',
  l1: 'L1',
  l2: 'L2',
  r1: 'R1',
  r2: 'R2',
  start: 'Options',
  pause: 'Esc'
};
