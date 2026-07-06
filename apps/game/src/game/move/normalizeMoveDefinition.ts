import type {
  MoveDefinition,
  NormalizedMoveDefinition
} from './moveDefinitionTypes';

const assertPositive = (value: number, label: string) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`);
  }
};

export const sourceFrameToBeat = (
  sourceFrame: number,
  sourceFrameCount: number,
  durationBeats: number
) => (sourceFrame / sourceFrameCount) * durationBeats;

export const beatsToRuntimeTicks = (
  beats: number,
  bpm: number,
  tickRate: number
) => Math.round(beats * (60 / bpm) * tickRate);

export function normalizeMoveDefinition(
  definition: MoveDefinition,
  bpm: number,
  tickRate: number
): NormalizedMoveDefinition {
  assertPositive(definition.sourceFps, 'Source FPS');
  assertPositive(definition.sourceFrameCount, 'Source frame count');
  assertPositive(definition.durationBeats, 'Move duration in beats');
  assertPositive(bpm, 'BPM');
  assertPositive(tickRate, 'Tick rate');

  const durationSeconds = definition.durationBeats * (60 / bpm);
  const authoredDurationSeconds = definition.sourceFrameCount / definition.sourceFps;
  const frameToBeat = (frame: number) =>
    sourceFrameToBeat(frame, definition.sourceFrameCount, definition.durationBeats);
  const beatToTick = (beat: number) => beatsToRuntimeTicks(beat, bpm, tickRate);

  const loopBeats = definition.loop
    ? {
        start: frameToBeat(definition.loop.startFrame),
        end: frameToBeat(definition.loop.endFrame)
      }
    : null;

  return {
    ...definition,
    runtimeBpm: bpm,
    tickRate,
    durationSeconds,
    durationTicks: beatToTick(definition.durationBeats),
    authoredDurationSeconds,
    animationTimeScale: authoredDurationSeconds / durationSeconds,
    loopBeats,
    loopTicks: loopBeats
      ? { start: beatToTick(loopBeats.start), end: beatToTick(loopBeats.end) }
      : null,
    normalizedCues: definition.cues.map((cue) => {
      const targetBeat = frameToBeat(cue.sourceFrame);
      const earlyBeat = frameToBeat(cue.earlyWindowFrames);
      const lateBeat = frameToBeat(cue.lateWindowFrames);
      return {
        ...cue,
        targetBeat,
        targetTickOffset: beatToTick(targetBeat),
        earlyWindowTicks: beatToTick(earlyBeat),
        lateWindowTicks: beatToTick(lateBeat)
      };
    }),
    normalizedTransitions: definition.transitions.map((transition) => {
      const windowStartBeat = frameToBeat(transition.windowStartFrame);
      const windowEndBeat = frameToBeat(transition.windowEndFrame);
      return {
        ...transition,
        windowStartBeat,
        windowEndBeat,
        windowStartTick: beatToTick(windowStartBeat),
        windowEndTick: beatToTick(windowEndBeat)
      };
    })
  };
}
