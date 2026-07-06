export const DEFAULT_SIMULATION_TICK_RATE = 60;
export const DEFAULT_BEAT_SUBDIVISIONS = 4;

export type RhythmClockSnapshot = {
  tick: number;
  tickRate: number;
  bpm: number;
  elapsedSeconds: number;
  beat: number;
  beatIndex: number;
  beatPhase: number;
  subdivision: number;
  subdivisionsPerBeat: number;
};

type RhythmClockListener = () => void;

const assertPositiveFinite = (value: number, label: string) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`);
  }
};

export class RhythmClock {
  private readonly listeners = new Set<RhythmClockListener>();
  private readonly tickRate: number;
  private readonly subdivisionsPerBeat: number;
  private accumulatorMs = 0;
  private snapshot: RhythmClockSnapshot;

  constructor(
    bpm = 120,
    tickRate = DEFAULT_SIMULATION_TICK_RATE,
    subdivisionsPerBeat = DEFAULT_BEAT_SUBDIVISIONS
  ) {
    assertPositiveFinite(bpm, 'BPM');
    assertPositiveFinite(tickRate, 'Tick rate');
    assertPositiveFinite(subdivisionsPerBeat, 'Beat subdivisions');

    this.tickRate = tickRate;
    this.subdivisionsPerBeat = Math.max(1, Math.floor(subdivisionsPerBeat));
    this.snapshot = this.createSnapshot(0, bpm, 0);
  }

  subscribe = (listener: RhythmClockListener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  setBpm(bpm: number) {
    assertPositiveFinite(bpm, 'BPM');
    if (this.snapshot.bpm === bpm) return;
    this.snapshot = this.createSnapshot(this.snapshot.tick, bpm, this.snapshot.beat);
    this.emit();
  }

  advance(deltaMs: number) {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return 0;

    const tickDurationMs = 1000 / this.tickRate;
    this.accumulatorMs += deltaMs;
    const steps = Math.floor(this.accumulatorMs / tickDurationMs);
    if (steps <= 0) return 0;

    this.accumulatorMs -= steps * tickDurationMs;
    this.step(steps);
    return steps;
  }

  step(steps = 1) {
    const normalizedSteps = Math.max(0, Math.floor(steps));
    if (normalizedSteps === 0) return;

    const nextTick = this.snapshot.tick + normalizedSteps;
    const beatDelta = normalizedSteps * (this.snapshot.bpm / (60 * this.tickRate));
    this.snapshot = this.createSnapshot(nextTick, this.snapshot.bpm, this.snapshot.beat + beatDelta);
    this.emit();
  }

  reset() {
    this.accumulatorMs = 0;
    this.snapshot = this.createSnapshot(0, this.snapshot.bpm, 0);
    this.emit();
  }

  private createSnapshot(tick: number, bpm: number, beat: number): RhythmClockSnapshot {
    const beatIndex = Math.floor(beat);
    const beatPhase = beat - beatIndex;
    return {
      tick,
      tickRate: this.tickRate,
      bpm,
      elapsedSeconds: tick / this.tickRate,
      beat,
      beatIndex,
      beatPhase,
      subdivision: Math.min(
        this.subdivisionsPerBeat - 1,
        Math.floor(beatPhase * this.subdivisionsPerBeat)
      ),
      subdivisionsPerBeat: this.subdivisionsPerBeat
    };
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}
