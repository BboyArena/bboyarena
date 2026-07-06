import {
  PLAYER_MOTION_INTENT_IDS,
  type PlayerMotionIntentId
} from '../motion/playerMotionTypes';
import {
  ANIMATION_CATALOG_SCHEMA_VERSION,
  type AnimationCatalog,
  type AnimationDefinition,
  type AnimationLoopMode,
  type AnimationPlaybackDefinition
} from './animationCatalogTypes';

const intentIds = new Set<string>(PLAYER_MOTION_INTENT_IDS);
const loopModes = new Set<AnimationLoopMode>(['once', 'repeat']);

export class AnimationCatalogValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid animation catalog:\n- ${issues.join('\n- ')}`);
    this.name = 'AnimationCatalogValidationError';
    this.issues = issues;
  }
}

export type AnimationCatalogValidationResult =
  | { success: true; data: AnimationCatalog }
  | { success: false; error: AnimationCatalogValidationError };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readNonEmptyString = (
  value: unknown,
  path: string,
  issues: string[]
): string | null => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push(`${path} must be a non-empty string.`);
    return null;
  }

  return value;
};

const readFiniteNumber = (
  value: unknown,
  path: string,
  issues: string[],
  minimum: number,
  minimumInclusive: boolean
): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    issues.push(`${path} must be a finite number.`);
    return null;
  }

  const valid = minimumInclusive ? value >= minimum : value > minimum;
  if (!valid) {
    issues.push(`${path} must be ${minimumInclusive ? 'at least' : 'greater than'} ${minimum}.`);
    return null;
  }

  return value;
};

const parsePlayback = (
  value: unknown,
  path: string,
  issues: string[]
): AnimationPlaybackDefinition | null => {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object.`);
    return null;
  }

  const loop = value.loop;
  if (typeof loop !== 'string' || !loopModes.has(loop as AnimationLoopMode)) {
    issues.push(`${path}.loop must be "once" or "repeat".`);
  }

  const speed = readFiniteNumber(value.speed, `${path}.speed`, issues, 0, false);
  const fadeInMs = readFiniteNumber(value.fadeInMs, `${path}.fadeInMs`, issues, 0, true);
  const fadeOutMs = readFiniteNumber(value.fadeOutMs, `${path}.fadeOutMs`, issues, 0, true);

  if (
    typeof loop !== 'string' ||
    !loopModes.has(loop as AnimationLoopMode) ||
    speed === null ||
    fadeInMs === null ||
    fadeOutMs === null
  ) {
    return null;
  }

  return {
    loop: loop as AnimationLoopMode,
    speed,
    fadeInMs,
    fadeOutMs
  };
};

const parseAnimation = (
  value: unknown,
  index: number,
  issues: string[]
): AnimationDefinition | null => {
  const path = `animations[${index}]`;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object.`);
    return null;
  }

  const id = readNonEmptyString(value.id, `${path}.id`, issues);
  const intentId = readNonEmptyString(value.intentId, `${path}.intentId`, issues);
  const source = readNonEmptyString(value.source, `${path}.source`, issues);
  const clip = readNonEmptyString(value.clip, `${path}.clip`, issues);
  const playback = parsePlayback(value.playback, `${path}.playback`, issues);

  if (intentId !== null && !intentIds.has(intentId)) {
    issues.push(`${path}.intentId "${intentId}" is not a supported player motion intent.`);
  }

  if (
    id === null ||
    intentId === null ||
    !intentIds.has(intentId) ||
    source === null ||
    clip === null ||
    playback === null
  ) {
    return null;
  }

  return {
    id,
    intentId: intentId as PlayerMotionIntentId,
    source,
    clip,
    playback
  };
};

export function parseAnimationCatalog(value: unknown): AnimationCatalog {
  const issues: string[] = [];

  if (!isRecord(value)) {
    throw new AnimationCatalogValidationError(['Catalog root must be an object.']);
  }

  if (value.version !== ANIMATION_CATALOG_SCHEMA_VERSION) {
    issues.push(`version must be ${ANIMATION_CATALOG_SCHEMA_VERSION}.`);
  }

  const catalogId = readNonEmptyString(value.catalogId, 'catalogId', issues);
  const catalogRevision = readNonEmptyString(value.catalogRevision, 'catalogRevision', issues);

  if (!Array.isArray(value.animations) || value.animations.length === 0) {
    issues.push('animations must be a non-empty array.');
  }

  const animations = Array.isArray(value.animations)
    ? value.animations
        .map((animation, index) => parseAnimation(animation, index, issues))
        .filter((animation): animation is AnimationDefinition => animation !== null)
    : [];

  const animationIds = new Set<string>();
  const mappedIntentIds = new Set<PlayerMotionIntentId>();
  for (const animation of animations) {
    if (animationIds.has(animation.id)) {
      issues.push(`animations contains duplicate id "${animation.id}".`);
    }
    animationIds.add(animation.id);

    if (mappedIntentIds.has(animation.intentId)) {
      issues.push(`animations contains more than one mapping for intent "${animation.intentId}".`);
    }
    mappedIntentIds.add(animation.intentId);
  }

  for (const intentId of PLAYER_MOTION_INTENT_IDS) {
    if (!mappedIntentIds.has(intentId)) {
      issues.push(`animations is missing a mapping for intent "${intentId}".`);
    }
  }

  if (issues.length > 0 || catalogId === null || catalogRevision === null) {
    throw new AnimationCatalogValidationError(issues);
  }

  return {
    version: ANIMATION_CATALOG_SCHEMA_VERSION,
    catalogId,
    catalogRevision,
    animations
  };
}

export function validateAnimationCatalog(value: unknown): AnimationCatalogValidationResult {
  try {
    return { success: true, data: parseAnimationCatalog(value) };
  } catch (error) {
    if (error instanceof AnimationCatalogValidationError) {
      return { success: false, error };
    }

    throw error;
  }
}
