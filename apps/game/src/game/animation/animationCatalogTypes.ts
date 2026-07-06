import type { PlayerMotionIntentId } from '../motion/playerMotionTypes';

export const ANIMATION_CATALOG_SCHEMA_VERSION = 1;

export type AnimationLoopMode = 'once' | 'repeat';

export type AnimationPlaybackDefinition = {
  loop: AnimationLoopMode;
  speed: number;
  fadeInMs: number;
  fadeOutMs: number;
};

export type AnimationDefinition = {
  id: string;
  intentId: PlayerMotionIntentId;
  source: string;
  clip: string;
  playback: AnimationPlaybackDefinition;
};

export type AnimationCatalog = {
  version: typeof ANIMATION_CATALOG_SCHEMA_VERSION;
  catalogId: string;
  catalogRevision: string;
  animations: AnimationDefinition[];
};
