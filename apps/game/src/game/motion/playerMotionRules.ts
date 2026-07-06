import type {
  PlayerMotionIntent,
  PlayerMotionIntentId,
  SerializableVector2
} from './playerMotionTypes';

const performingIntentIds = new Set<PlayerMotionIntentId>([
  'move.neon.pulse',
  'move.comet.sweep',
  'move.axis.break',
  'pose.signal.lock'
]);

export const hasMovement = (movement: SerializableVector2) =>
  Math.hypot(movement.x, movement.y) > 0.0001;

export const isMoveIntent = (
  intent: PlayerMotionIntent
): intent is Extract<PlayerMotionIntent, { type: 'motion.move' }> =>
  intent.type === 'motion.move';

export const isPerformIntent = (
  intent: PlayerMotionIntent
): intent is Extract<PlayerMotionIntent, { type: 'motion.perform' }> =>
  intent.type === 'motion.perform';

export const isReleaseIntent = (
  intent: PlayerMotionIntent
): intent is Extract<PlayerMotionIntent, { type: 'motion.release' }> =>
  intent.type === 'motion.release';

export const isPerformingIntentId = (intentId: PlayerMotionIntentId) =>
  performingIntentIds.has(intentId);

export const resolveGroundedIntentId = (
  movement: SerializableVector2
): PlayerMotionIntentId => hasMovement(movement) ? 'movement.toprock' : 'movement.idle';

export const canInterruptMotion = (
  activeIntentId: PlayerMotionIntentId | null,
  nextIntentId: PlayerMotionIntentId
) =>
  activeIntentId === null ||
  activeIntentId.startsWith('movement.') ||
  activeIntentId === nextIntentId ||
  nextIntentId === 'pose.signal.lock';
