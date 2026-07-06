import type {
  PlayerMotionIntent,
  PlayerMotionSnapshot
} from '../motion/playerMotionTypes';
export { DEFAULT_SIMULATION_TICK_RATE } from '../rhythm/RhythmClock';

export const PLAYER_REPLAY_FORMAT_VERSION = 1;

export type ReplayEventSource = 'live' | 'replay';

type ReplayEventBase = {
  tick: number;
  elapsedMs: number;
};

export type ReplayTimelineEvent =
  | (ReplayEventBase & {
      type: 'motion.intent';
      intent: PlayerMotionIntent;
    })
  | (ReplayEventBase & { type: 'game.pause' })
  | (ReplayEventBase & { type: 'game.resume' })
  | (ReplayEventBase & { type: 'game.reset' });

export type PlayerReplay = {
  formatVersion: typeof PLAYER_REPLAY_FORMAT_VERSION;
  gameplayVersion: string;
  catalogRevision: string;
  tickRate: number;
  seed: number;
  mode: string;
  bpm: number;
  characterId: string;
  initialState: PlayerMotionSnapshot;
  events: ReplayTimelineEvent[];
  finalState: PlayerMotionSnapshot | null;
};

export type ReplayDispatch = {
  source: ReplayEventSource;
  event: ReplayTimelineEvent;
};
