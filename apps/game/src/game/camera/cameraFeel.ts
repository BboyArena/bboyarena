import type { PlayerMotionSnapshot } from '../motion/playerMotionTypes';

export type CameraFeel = 'fixed' | 'dynamic';
export type DynamicCameraProfile = 'cypher' | 'footwork' | 'hype';

export const CAMERA_FEELS: CameraFeel[] = ['fixed', 'dynamic'];

export type CameraFeelSettings = {
  basePosition: readonly [number, number, number];
  target: readonly [number, number, number];
  lateralAmount: number;
  verticalAmount: number;
  depthAmount: number;
  noiseAmount: number;
  orbitAmount: number;
  movePushIn: number;
  lerpSpeed: number;
  fov: number;
};

export const CAMERA_FEEL_SETTINGS: Record<DynamicCameraProfile, CameraFeelSettings> = {
  cypher: {
    basePosition: [0, 3.15, 7.35],
    target: [0, 1.12, 0],
    lateralAmount: 0.05,
    verticalAmount: 0.22,
    depthAmount: 0.06,
    noiseAmount: 0.018,
    orbitAmount: 0.015,
    movePushIn: 0.08,
    lerpSpeed: 8,
    fov: 44
  },
  footwork: {
    basePosition: [0, 3.08, 7],
    target: [0, 1.14, 0],
    lateralAmount: 0.065,
    verticalAmount: 0.34,
    depthAmount: 0.075,
    noiseAmount: 0.022,
    orbitAmount: 0.02,
    movePushIn: 0.12,
    lerpSpeed: 8.8,
    fov: 45
  },
  hype: {
    basePosition: [0, 2.95, 6.45],
    target: [0, 1.18, 0],
    lateralAmount: 0.08,
    verticalAmount: 0.52,
    depthAmount: 0.1,
    noiseAmount: 0.026,
    orbitAmount: 0.025,
    movePushIn: 0.18,
    lerpSpeed: 9.5,
    fov: 47
  }
};

export function resolveDynamicCameraProfile(playerMotionState: PlayerMotionSnapshot): DynamicCameraProfile {
  const intentId = playerMotionState.activeIntentId;

  if (intentId === 'move.powermove.default') return 'hype';
  if (intentId?.startsWith('move.footwork')) return 'footwork';

  return 'cypher';
}

export function resolveCameraMoveIntensity(gameState: string, playerMotionState: PlayerMotionSnapshot) {
  if (gameState === 'paused') return 0.08;
  if (gameState !== 'playing') return 0.18;

  const intentId = playerMotionState.activeIntentId;
  const balance = Math.max(0, Math.min(1.2, playerMotionState.balance));
  const angularEnergy = Math.max(0, Math.min(1, playerMotionState.angularVelocity / 8));

  if (intentId === 'move.freeze.default') return 0.18;
  if (intentId === 'move.powermove.default') return 0.85 + angularEnergy * 0.15;
  if (intentId?.startsWith('move.footwork')) return 0.62 + balance * 0.12;
  if (intentId?.startsWith('move.toprock') || intentId === 'movement.toprock') return 0.48 + balance * 0.1;

  return 0.32;
}

export function isCameraFreezeMoment(playerMotionState: PlayerMotionSnapshot) {
  return playerMotionState.activeIntentId === 'move.freeze.default';
}
