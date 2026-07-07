export const PLAYER_MOTION_INTENT_IDS = [
  'movement.idle',
  'movement.toprock',
  'move.toprock.default',
  'move.toprock.indianstep',
  'move.footwork.threestep',
  'move.footwork.sixstep',
  'move.freeze.default',
  'move.powermove.default'
] as const;

export type PlayerMotionIntentId = (typeof PLAYER_MOTION_INTENT_IDS)[number];

export const PLAYER_MOTION_INTENT_LABELS: Record<PlayerMotionIntentId, string> = {
  'movement.idle': 'Idle',
  'movement.toprock': 'Toprock',
  'move.toprock.default': 'Default Toprock',
  'move.toprock.indianstep': 'Indian Step',
  'move.footwork.threestep': 'Three-step',
  'move.footwork.sixstep': 'Six-step',
  'move.freeze.default': 'Default Freeze',
  'move.powermove.default': 'Default Powermove'
};

export type SerializableVector2 = {
  x: number;
  y: number;
};

export type SerializableVector3 = {
  x: number;
  y: number;
  z: number;
};

export type PlayerMotionIntent =
  | {
      type: 'motion.move';
      movement: SerializableVector2;
    }
  | {
      type: 'motion.perform';
      intentId: PlayerMotionIntentId;
    }
  | {
      type: 'motion.release';
      intentId: PlayerMotionIntentId;
    }
  | {
      type: 'motion.stop';
    };

export type PlayerMotionPhase =
  | 'inactive'
  | 'idle'
  | 'moving'
  | 'starting'
  | 'active'
  | 'recovering'
  | 'paused';

export type PlayerMotionSnapshot = {
  tick: number;
  phase: PlayerMotionPhase;
  movement: SerializableVector2;
  facing: SerializableVector3;
  rotationAxis: SerializableVector3;
  angularVelocity: number;
  balance: number;
  contactPoint: SerializableVector3 | null;
  activeIntentId: PlayerMotionIntentId | null;
};

export type PlayerMotionMachineEvent =
  | { type: 'ENABLE' }
  | { type: 'DISABLE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'TICK'; tick: number }
  | { type: 'INTENT'; intent: PlayerMotionIntent; tick: number };

export const createInitialPlayerMotionSnapshot = (): PlayerMotionSnapshot => ({
  tick: 0,
  phase: 'inactive',
  movement: { x: 0, y: 0 },
  facing: { x: 0, y: 0, z: 1 },
  rotationAxis: { x: 0, y: 1, z: 0 },
  angularVelocity: 0,
  balance: 1,
  contactPoint: null,
  activeIntentId: null
});
