import type {
  PlayerMotionIntent,
  PlayerMotionIntentId,
  SerializableVector2
} from './playerMotionTypes';

const performingIntentIds = new Set<PlayerMotionIntentId>([
  'move.toprock.default',
  'move.footwork.default',
  'move.freeze.default',
  'move.powermove.default'
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
  nextIntentId === 'move.freeze.default';
