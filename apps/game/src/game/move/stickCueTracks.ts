import {
  STICK_CONTROLLER_ROLES,
  type StickCueTrack
} from './moveDefinitionTypes';

export const DEFAULT_STICK_CUE_TOLERANCE = 0.2;
export const MAX_STICK_CUE_TOLERANCE = 2;

export type StickCueSample = {
  x: number;
  y: number;
  tolerance: number;
  fromPointIndex: number;
  toPointIndex: number;
};

export type StickCueStepSample = StickCueSample & {
  pointIndex: number;
  active: boolean;
  beatsUntilStep: number;
};

export type StickCueTrackValidationResult = {
  issues: string[];
  warnings: string[];
};

const controllerRoles = new Set<string>(STICK_CONTROLLER_ROLES);
const targetInputs = new Set<string>(['movement', 'look', 'custom']);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isFiniteInRange = (value: unknown, minimum: number, maximum: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;

export function validateStickCueTrack(
  value: unknown,
  path = 'stickCueTrack'
): StickCueTrackValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(value)) {
    return { issues: [`${path} must be an object.`], warnings };
  }

  if (typeof value.id !== 'string' || value.id.trim().length === 0) {
    issues.push(`${path}.id must be a non-empty string.`);
  }
  if (typeof value.label !== 'string' || value.label.trim().length === 0) {
    issues.push(`${path}.label must be a non-empty string.`);
  }
  if (value.stick !== 'left' && value.stick !== 'right') {
    issues.push(`${path}.stick must be "left" or "right".`);
  }
  if (typeof value.controllerRole !== 'string' || !controllerRoles.has(value.controllerRole)) {
    issues.push(`${path}.controllerRole is not supported.`);
  }
  if (value.targetInput !== undefined &&
      (typeof value.targetInput !== 'string' || !targetInputs.has(value.targetInput))) {
    issues.push(`${path}.targetInput must be "movement", "look", or "custom".`);
  }
  if (value.targetInput === 'custom' &&
      (typeof value.customTargetInputId !== 'string' || value.customTargetInputId.trim().length === 0)) {
    issues.push(`${path}.customTargetInputId is required for a custom target input.`);
  }
  if (value.loop !== undefined && typeof value.loop !== 'boolean') {
    issues.push(`${path}.loop must be a boolean when provided.`);
  }

  if (!Array.isArray(value.points) || value.points.length < 2) {
    issues.push(`${path}.points must contain at least two points.`);
    return { issues, warnings };
  }

  let previousTime = -Infinity;
  value.points.forEach((point, index) => {
    const pointPath = `${path}.points[${index}]`;
    if (!isRecord(point)) {
      issues.push(`${pointPath} must be an object.`);
      return;
    }
    if (!isFiniteInRange(point.t, 0, 1)) issues.push(`${pointPath}.t must be finite and between 0 and 1.`);
    if (!isFiniteInRange(point.x, -1, 1)) issues.push(`${pointPath}.x must be finite and between -1 and 1.`);
    if (!isFiniteInRange(point.y, -1, 1)) issues.push(`${pointPath}.y must be finite and between -1 and 1.`);
    if (point.tolerance !== undefined && !isFiniteInRange(point.tolerance, Number.EPSILON, MAX_STICK_CUE_TOLERANCE)) {
      issues.push(`${pointPath}.tolerance must be positive and no greater than ${MAX_STICK_CUE_TOLERANCE}.`);
    }
    if (typeof point.t === 'number' && Number.isFinite(point.t)) {
      if (point.t <= previousTime) issues.push(`${pointPath}.t must be greater than the previous point time.`);
      previousTime = point.t;
    }
  });

  const firstPoint = value.points[0];
  const lastPoint = value.points[value.points.length - 1];
  if (isRecord(firstPoint) && firstPoint.t !== 0) warnings.push(`${path} starts after t = 0.`);
  if (isRecord(lastPoint) && lastPoint.t !== 1) warnings.push(`${path} ends before t = 1.`);

  return { issues, warnings };
}

export function assertValidMoveStickCueTracks(moves: unknown): void {
  if (!Array.isArray(moves)) throw new Error('Move catalog moves must be an array.');

  const issues: string[] = [];
  const warnings: string[] = [];
  moves.forEach((move, moveIndex) => {
    if (!isRecord(move)) {
      issues.push(`moves[${moveIndex}] must be an object.`);
      return;
    }
    if (!Array.isArray(move.stickCueTracks)) {
      issues.push(`moves[${moveIndex}].stickCueTracks must be an array.`);
      return;
    }
    if (move.stickCueTracks.length !== 2) {
      issues.push(`moves[${moveIndex}].stickCueTracks must contain exactly two tracks.`);
    }
    const ids = new Set<string>();
    const sticks = new Set<string>();
    move.stickCueTracks.forEach((track, trackIndex) => {
      const path = `moves[${moveIndex}].stickCueTracks[${trackIndex}]`;
      const result = validateStickCueTrack(track, path);
      issues.push(...result.issues);
      warnings.push(...result.warnings);
      if (isRecord(track) && typeof track.id === 'string') {
        if (ids.has(track.id)) issues.push(`${path}.id duplicates "${track.id}" within the move.`);
        ids.add(track.id);
      }
      if (isRecord(track) && typeof track.stick === 'string') {
        if (sticks.has(track.stick)) issues.push(`${path}.stick duplicates "${track.stick}" within the move.`);
        sticks.add(track.stick);
        const expectedRole = track.stick === 'left' ? 'upper-body' : 'lower-body';
        const expectedInput = track.stick === 'left' ? 'movement' : 'look';
        if (track.controllerRole !== expectedRole) {
          issues.push(`${path}.controllerRole must be "${expectedRole}" for the ${track.stick} stick.`);
        }
        if (track.targetInput !== expectedInput) {
          issues.push(`${path}.targetInput must be "${expectedInput}" for the ${track.stick} stick.`);
        }
      }
    });
    if (!sticks.has('left') || !sticks.has('right')) {
      issues.push(`moves[${moveIndex}].stickCueTracks must assign one left and one right stick.`);
    }
  });

  if (issues.length > 0) throw new Error(`Invalid move stick cue tracks:\n- ${issues.join('\n- ')}`);
  if (warnings.length > 0) console.warn(`Move stick cue track warnings:\n- ${warnings.join('\n- ')}`);
}

export function sampleStickCueTrack(track: StickCueTrack, progress: number): StickCueSample {
  if (track.points.length < 2) throw new Error(`Stick cue track "${track.id}" needs at least two points.`);

  const finiteProgress = Number.isFinite(progress) ? progress : 0;
  const sampledProgress = track.loop
    ? ((finiteProgress % 1) + 1) % 1
    : Math.min(1, Math.max(0, finiteProgress));

  let toPointIndex = track.points.findIndex((point) => point.t >= sampledProgress);
  if (toPointIndex < 0) toPointIndex = track.points.length - 1;
  if (toPointIndex === 0) toPointIndex = 1;
  const fromPointIndex = toPointIndex - 1;
  const from = track.points[fromPointIndex];
  const to = track.points[toPointIndex];
  const segmentDuration = to.t - from.t;
  const amount = segmentDuration > 0
    ? Math.min(1, Math.max(0, (sampledProgress - from.t) / segmentDuration))
    : 0;
  const fromTolerance = from.tolerance ?? DEFAULT_STICK_CUE_TOLERANCE;
  const toTolerance = to.tolerance ?? DEFAULT_STICK_CUE_TOLERANCE;

  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
    tolerance: fromTolerance + (toTolerance - fromTolerance) * amount,
    fromPointIndex,
    toPointIndex
  };
}

/** Treat authored cue points as timed gameplay steps, not a path the player must trace. */
export function sampleStickCueStep(
  track: StickCueTrack,
  progress: number,
  durationBeats: number,
  timingWindowBeats: number
): StickCueStepSample {
  if (track.points.length === 0) throw new Error(`Stick cue track "${track.id}" needs at least one point.`);

  const safeDuration = Math.max(Number.EPSILON, durationBeats);
  const normalizedProgress = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const nearestIndex = track.points.reduce((bestIndex, point, index) => (
    Math.abs(point.t - normalizedProgress) < Math.abs(track.points[bestIndex].t - normalizedProgress)
      ? index
      : bestIndex
  ), 0);
  const nearestPoint = track.points[nearestIndex];
  const distanceBeats = Math.abs(nearestPoint.t - normalizedProgress) * safeDuration;
  const upcomingIndex = track.points.findIndex((point) => point.t >= normalizedProgress);
  const pointIndex = distanceBeats <= timingWindowBeats
    ? nearestIndex
    : (upcomingIndex >= 0 ? upcomingIndex : track.points.length - 1);
  const point = track.points[pointIndex];
  const beatsUntilStep = (point.t - normalizedProgress) * safeDuration;

  return {
    x: point.x,
    y: point.y,
    tolerance: point.tolerance ?? DEFAULT_STICK_CUE_TOLERANCE,
    fromPointIndex: pointIndex,
    toPointIndex: pointIndex,
    pointIndex,
    active: Math.abs(beatsUntilStep) <= timingWindowBeats,
    beatsUntilStep
  };
}
