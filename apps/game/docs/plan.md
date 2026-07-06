# Player Motion, Animation, and Replay Plan

This task list tracks the incremental separation of player motion state, animation playback, and replay recording. It is the implementation plan for this feature, not a replacement for the repository [project specification](../../../PROJECT_SPEC.md) or [current architecture](../../../docs/current-architecture.md).

## Goal

Build a deterministic player-motion pipeline in which:

- physical input becomes semantic player intent;
- XState owns gameplay motion transitions;
- animation definitions are loaded from a replaceable catalog source;
- animation playback remains separate from gameplay rules;
- accepted gameplay intents can be recorded and replayed on a timeline;
- the standalone game remains playable and buildable after every phase.

## Target flow

```text
Live input ──→ Intent resolver ──→ Player motion machine ──→ Animation playback
                                           │                         ▲
                                           ▼                         │
                                     Replay recorder                 │
                                           │                         │
                                           ▼                         │
                                     Replay timeline ──→ Replay player
```

Both live and replayed intents must pass through the same player motion machine.

## Progress

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 0 — Baseline and contracts | Complete | Contracts added without changing runtime behavior; game build and focused type-check pass. |
| Phase 1 — Animation catalog | Complete | Versioned procedural catalog, strict types, safe validation, and actionable errors added. |
| Phase 2 — Replaceable catalog loading | Complete | Local and HTTP sources share one interface with cancellation, safe results, and local fallback. |
| Phase 3 — Player motion machine | Complete | Core machine is active in `GamePlayScene`; the legacy derived state has been removed. |
| Phase 4 — Intent resolver | Complete | Edge-aware, device-independent resolver added and tested. |
| Phase 5 — Animation playback machine | Complete | Catalog actor, resolution, playback lifecycle, fallback failure state, and observable outcomes implemented. |
| Phase 6 — Runtime integration | Visual verification pending | Runtime wiring and diagnostic HUD are complete; final visual confirmation remains. |
| Phase 7 — Deterministic replay foundation | In progress | Global fixed-step rhythm clock is active; replay recording and tempo-change events remain. |
| Phase 8 — Replay recorder | Not started | Depends on the replay clock and format. |
| Phase 9 — Replay player | Not started | Depends on recorder-compatible events. |
| Phase 10 — Timeline and seeking | Not started | Depends on stable playback. |
| Phase 11 — Persistence and future API support | Not started | Depends on validated replay data. |

### Phase 0 verification

- `npm run game:build`: passed.
- Focused strict TypeScript check for the new motion, animation, and replay contracts: passed.
- `git diff --check`: passed.
- Full-workspace `tsc --noEmit`: currently blocked by pre-existing `nipplejs` typing errors and missing Colyseus packages in the root workspace. These failures are outside the Phase 0 files and are not introduced by this work.

### Phase 1 verification

- Local catalog validation: passed with all six supported intent mappings.
- Invalid duplicate mapping rejection: passed.
- Focused strict TypeScript compilation: passed.
- `npm run game:build`: passed.
- `git diff --check`: passed.

### Phase 2 verification

- Local JSON source load: passed.
- Mock HTTP source load: passed.
- Invalid remote catalog fallback to local data: passed.
- Aborted load propagation without fallback: passed.
- Failed source result normalization: passed.
- Focused strict TypeScript compilation: passed.
- `npm run game:build`: passed.
- `git diff --check`: passed.

### Phase 3 verification

- Inactive, grounded idle/moving, performing, and paused transitions: passed.
- Interruption guards and default Freeze priority: passed.
- Pause/resume deep-history restoration: passed.
- Movement updates during an active performance: passed.
- Focused strict TypeScript compilation: passed.
- `npm run game:build`: passed.
- `git diff --check`: passed.

### Phase 4 verification

- Primary press/release edge detection: passed.
- Held-button repeat prevention: passed.
- Canonical family fallback intent and tracked release: passed.
- Keyboard/gamepad canonical parity: passed.
- Focused strict TypeScript compilation: passed.
- `npm run game:build`: passed.
- `git diff --check`: passed.

### Phase 5 verification

- Catalog actor loading and ready state: passed.
- Intent-to-animation resolution and started outcome: passed.
- Playback pause/resume: passed.
- Completion and return to idle: passed.
- Invalid catalog transition to recoverable failed state: passed.
- Focused strict TypeScript compilation: passed.
- `npm run game:build`: passed.
- `git diff --check`: passed.

### Phase 6 verification

- `GamePlayScene` actor integration: build-verified.
- Legacy `PlayerMotionState` references: none remain.
- Motion-to-playback intent synchronization: implemented through accepted motion snapshots.
- Diagnostic HUD data: available in Training mode.
- Pause/resume input wiring: implemented for the Pause action.
- Training mode auto-starts its internal game lifecycle so diagnostic intents are accepted immediately.
- `npm run game:build`: passed.
- `npm run build`: passed with 91 static website pages.
- `git diff --check`: passed.
- Manual visual interaction: pending.

## Architectural rules

- [ ] Keep `gameMachine` responsible only for the global game lifecycle.
- [ ] Keep gameplay decisions inside `playerMotionMachine`.
- [ ] Keep clip loading, playback, looping, and crossfading inside the animation layer.
- [ ] Keep animation filenames and clip names out of player intent types.
- [ ] Keep gameplay eligibility and interruption rules out of the remote animation catalog.
- [ ] Store only plain serializable values in XState context; do not store mutable Three.js objects.
- [ ] Record accepted semantic intents, not only hardware-specific input events.
- [ ] Use a fixed simulation tick for replay-sensitive gameplay decisions.
- [ ] Do not add a new dependency unless the existing stack cannot satisfy a concrete requirement.

## Proposed source layout

```text
apps/game/src/game/
├── animation/
│   ├── data/animations.json
│   ├── animationCatalogTypes.ts
│   ├── animationCatalogValidation.ts
│   ├── animationCatalogLoader.ts
│   └── animationPlaybackMachine.ts
├── motion/
│   ├── playerMotionTypes.ts
│   ├── playerMotionRules.ts
│   ├── playerIntentResolver.ts
│   └── playerMotionMachine.ts
├── replay/
│   ├── replayTypes.ts
│   ├── replayValidation.ts
│   ├── replayClock.ts
│   ├── replayRecorder.ts
│   ├── replayPlayer.ts
│   └── replayStorage.ts
└── state/
    └── gameMachine.ts
```

The exact filenames may change during implementation, but the ownership boundaries must remain intact.

## Phase 0 — Baseline and contracts

- [x] Document the current input-to-render flow before changing behavior.
- [x] Define `PlayerMotionIntent` as a discriminated union.
- [x] Define serializable vector and contact-point types.
- [x] Define the public snapshot produced by the player motion machine.
- [x] Define the event protocol between motion and animation playback.
- [x] Define the event protocol used by the replay recorder and player.
- [x] Decide and document the initial fixed tick rate.
- [x] Confirm the first supported semantic intents.

Current baseline before migration:

```text
GameInputSnapshot
→ GamePlayScene useMemo
→ newly created legacy PlayerMotionState
→ CanvasScene props
→ Player useFrame
→ procedural mesh transforms
```

At the recorded baseline, `GamePlayScene` derived move selection directly from held input, BPM, and the global game lifecycle. `Player` then combined gameplay interpretation with procedural presentation. Phase 6 replaced this legacy flow; the baseline remains here for comparison.

The initial simulation rate is `60` ticks per second. This is a gameplay/replay clock decision and does not require the renderer to run at 60 frames per second.

Initial intent candidates:

```text
movement.idle
movement.toprock
move.toprock.default
move.footwork.default
move.freeze.default
move.powermove.default
```

### Acceptance criteria

- [x] Types distinguish input, gameplay motion, animation playback, and replay data.
- [x] No type references an animation filename as a gameplay decision.
- [x] The proposed contracts can represent grounded movement and the four canonical default moves.

## Phase 1 — Animation catalog

- [x] Create `animation/data/animations.json` with a schema version.
- [x] Add stable animation definition IDs.
- [x] Map semantic `intentId` values to clip definitions.
- [x] Add playback-only metadata such as loop, speed, and fade durations.
- [x] Define `AnimationCatalog` and `AnimationDefinition` TypeScript types.
- [x] Add dependency-free runtime validation for unknown catalog data.
- [x] Reject duplicate animation IDs.
- [x] Reject missing or invalid intent mappings.
- [x] Produce actionable validation errors.

Suggested catalog shape:

```json
{
  "version": 1,
  "catalogId": "default-player",
  "catalogRevision": "2026.07.3",
  "animations": [
    {
      "id": "default-idle",
      "intentId": "movement.idle",
      "source": "/animations/player-default.glb",
      "clip": "Idle",
      "playback": {
        "loop": true,
        "speed": 1,
        "fadeInMs": 150,
        "fadeOutMs": 150
      }
    }
  ]
}
```

### Acceptance criteria

- [x] The local catalog passes runtime validation.
- [x] Invalid catalog data produces a safe validation result before render integration.
- [x] No gameplay transition rule is controlled by catalog data.

## Phase 2 — Replaceable catalog loading

- [x] Define an `AnimationCatalogSource` interface.
- [x] Implement an asynchronous local JSON source.
- [x] Design an HTTP source with the same interface.
- [x] Support `AbortSignal` for canceled loads.
- [x] Define loading, ready, and failure results.
- [x] Provide a known local fallback when remote loading fails.
- [x] Keep the selected source configurable at the game composition boundary.
- [x] Avoid direct `fetch` calls inside gameplay or rendering components.

### Acceptance criteria

- [x] Switching from local JSON to HTTP does not change motion-machine code.
- [x] The local fallback remains available when the remote catalog is unavailable.
- [x] Catalog revision information is available to the replay system.

## Phase 3 — Player motion machine

- [x] Create a typed XState `playerMotionMachine`.
- [x] Add the initial `inactive`, `grounded`, `performing`, and `paused` states.
- [x] Add nested `idle` and `moving` grounded states where useful.
- [x] Defer `starting`, `active`, and `recovering` sub-phases until real clip completion requires them.
- [x] Move movement, facing, balance, and contact data into serializable context.
- [x] Store the active semantic intent ID separately from animation state.
- [x] Implement guards for allowed motion transitions.
- [x] Implement interruption rules in motion code, not catalog data.
- [x] Define reset, pause, resume, and disable behavior.
- [x] Expose a small, typed motion snapshot to consumers.

### Acceptance criteria

- [x] `PlayerMotionState` is no longer reconstructed ad hoc in `GamePlayScene`.
- [x] The machine accepts the current input-driven behaviors.
- [x] State snapshots contain no `THREE.Vector3`, meshes, clips, or mixers.
- [x] The machine can be exercised without React or WebGL.

## Phase 4 — Intent resolver

- [x] Create an isolated resolver from canonical input snapshots to motion events.
- [x] Emit movement updates separately from discrete move requests.
- [x] Detect button press and release edges.
- [x] Prevent a held button from restarting the same move every render.
- [x] Keep keyboard, touch, and gamepad behavior equivalent.
- [x] Keep the original input source outside authoritative motion intents and available in the input snapshot for diagnostics.
- [x] Resolve canonical family presses into stable default fallback intents, with Freeze receiving interruption priority.

### Acceptance criteria

- [x] Identical canonical input produces identical motion events across devices.
- [x] Holding a canonical family button does not emit repeated start events.
- [x] The resolver is an isolated controller that can be tested independently.

## Phase 5 — Animation playback machine

- [x] Create a typed XState animation playback machine.
- [x] Add catalog loading, ready, playing, transitioning, and failed behavior.
- [x] Resolve accepted semantic intents through the loaded catalog.
- [x] Expose animation started, completed, interrupted, and failed outcomes.
- [x] Define missing-animation fallback behavior.
- [x] Resolve and expose playback speed, looping, and fade metadata to the future clip renderer.
- [x] Keep gameplay validity decisions outside this machine.
- [x] Define how pause and resume affect the active playback.

### Acceptance criteria

- [x] Motion state can exist and transition without an animation clip.
- [x] Animation failure does not corrupt gameplay motion state.
- [x] Changing a catalog mapping changes presentation without changing input or motion rules.

## Phase 6 — Runtime integration

- [x] Instantiate the motion and animation actors at the gameplay composition boundary.
- [x] Connect global game lifecycle events to motion and playback actors.
- [x] Replace `GamePlayScene` motion-state `useMemo` construction.
- [x] Pass a stable motion snapshot and resolved playback definition through `CanvasScene`.
- [x] Remove move-selection decisions from `Player.tsx`.
- [x] Keep serializable motion values independent from Three.js runtime objects.
- [x] Preserve the current procedural animation as a temporary fallback.
- [x] Add diagnostic display for game state, motion state, active intent, tick, catalog, fallback, playback state, and resolved animation.

### Acceptance criteria

- [ ] Existing grounded movement, canonical default moves, pause, and Freeze feedback works visually.
- [x] `Player.tsx` no longer decides which gameplay move is active.
- [x] Website and game builds still succeed independently.

## Canonical move-family history prototype

This prototype validates accepted default-move history before selection windows and scoring rules are designed.

- [x] Define the four canonical input families: Toprock, Footwork, Freeze, and Powermove.
- [x] Give every family a valid default fallback move.
- [x] Map each canonical touchscreen button directly to its default fallback.
- [x] Keep Freeze as the current interruption-priority fallback.
- [x] Record only performance intents accepted by the motion machine.
- [x] Exclude idle, grounded movement, raw device input, and rejected intents.
- [x] Store sequence, intent ID, animation ID, start tick, end tick, duration, and outcome.
- [x] Mark replaced moves as `interrupted` and released moves as `completed`.
- [x] Keep scoring explicit as `not-evaluated` with no numeric value.
- [x] Limit in-memory session history to the latest 24 entries.
- [x] Show the latest eight entries in the Training diagnostic HUD.
- [x] Display the four canonical touchscreen HUD buttons directly.

## Full touchscreen controller prototype

- [x] Add a four-direction D-pad and normalize diagonal movement.
- [x] Add independent left movement and right look analog sticks.
- [x] Present Toprock, Footwork, Freeze, and Powermove as A, B, X, and Y.
- [x] Add L1, L2, R1, and R2 canonical button states.
- [x] Add Options and Esc system controls.
- [x] Support simultaneous pointers through pointer capture and independent releases.
- [x] Display both stick vectors and all controller buttons in the Training diagnostics.
- [x] Map standard gamepad axes and shoulder indices to the same canonical snapshot.
- [x] Verify the game production build after integration.
- [ ] Visually verify ergonomics and overlap on target touchscreen aspect ratios.

### Verification

- Canonical default catalog validation: passed.
- Grounded intents excluded from history: passed.
- Accepted move start: passed.
- Accepted replacement interruption: passed.
- Released move completion and duration: passed.
- Rejected move does not change the authoritative motion intent: passed.
- Scoring remains `not-evaluated`: passed.
- `npm run game:build`: passed.
- `git diff --check`: passed.

### Scoring decision deferred

The history deliberately does not award points yet. A future scoring design must decide which execution evidence is authoritative, such as timing accuracy, completion, interruption, balance, contact quality, rhythm, and repetition. Animation playback alone must not determine gameplay score.

## Rhythm and authored move-timing prerequisite

All move execution and scoring must use the global musical clock rather than render frames or input-event counts.

- [x] Add a global fixed-step `RhythmClock` at 60 simulation ticks per second.
- [x] Read BPM from the existing game Zustand store.
- [x] Preserve continuous beat position when BPM changes.
- [x] Expose global tick, beat, beat phase, and quarter-beat subdivision.
- [x] Replace the temporary input-event tick counter in `GamePlayScene`.
- [x] Feed global rhythm ticks into `playerMotionMachine`.
- [x] Timestamp accepted move history with global ticks.
- [x] Display BPM, beat, phase, subdivision, and global tick in the Training HUD.
- [x] Define authored move phases, loops, cues, skills, and transition windows in source frames.
- [x] Preserve source FPS and frame count for animation-authoring alignment.
- [x] Normalize authored frames into beat positions and runtime tick offsets.
- [x] Compute runtime move duration and animation time scale from BPM.
- [x] Add four canonical default authored move definitions in local JSON.
- [ ] Add runtime validation and replaceable API loading for move definitions.
- [ ] Add the generic `moveExecutionMachine` that interprets phases, loops, and transition windows.
- [ ] Record canonical input evidence against the active move timeline.
- [ ] Record BPM changes as deterministic replay events.
- [ ] Apply normalized `animationTimeScale` to the future real clip player.

### Normalization rule

```text
source frame
→ sourceFrame / sourceFrameCount
→ beat offset inside move duration
→ runtime tick offset at current BPM
```

Input is captured immediately at the current global tick. Evaluation compares that tick with the normalized cue window; input must never be artificially delayed to match a move.

### Verification

- 60 ticks at 120 BPM advance the clock by 2 beats: passed.
- A BPM change from 120 to 60 preserves beat continuity: passed.
- Frame 10 of a 24-frame, 2-beat move at 120 BPM normalizes to tick 25: passed.
- The same 2-beat move lasts 60 ticks at 120 BPM and 120 ticks at 60 BPM: passed.
- Animation time scale normalizes to `1` at 120 BPM and `0.5` at 60 BPM for the prototype: passed.
- Focused strict TypeScript checks: passed.
- `npm run game:build`: passed.
- `git diff --check`: passed.

## Phase 7 — Deterministic replay foundation

- [x] Implement a fixed-step clock shared by live gameplay and future replay.
- [x] Define a versioned `PlayerReplay` format.
- [x] Store format, gameplay-rules, and animation-catalog versions.
- [x] Store tick rate, mode, BPM, selected character, and deterministic seed.
- [x] Define the minimum serializable initial player snapshot.
- [x] Define replay event types for accepted motion intents and lifecycle changes.
- [ ] Remove replay-sensitive dependencies on `Date.now()` and unseeded `Math.random()`.
- [x] Keep rendering delta time outside authoritative replay decisions.

Suggested replay envelope:

```json
{
  "formatVersion": 1,
  "gameplayVersion": "0.0.1",
  "catalogRevision": "2026.07.3",
  "tickRate": 60,
  "seed": 1,
  "initialState": {},
  "events": []
}
```

### Acceptance criteria

- [ ] A replay contains everything needed to initialize compatible motion state.
- [ ] Replay time is based on simulation ticks rather than render frames.
- [ ] Compatibility can be checked before playback begins.

## Phase 8 — Replay recorder

- [ ] Observe accepted transitions from the motion machine.
- [ ] Record semantic events with tick and elapsed simulation time.
- [ ] Record pause, resume, reset, and relevant mode changes.
- [ ] Avoid recording rejected intents as authoritative replay events.
- [ ] Optionally record raw input in a separate diagnostic channel.
- [ ] Prevent duplicate events generated within the same transition.
- [ ] Finalize the timeline with an end-state snapshot and checksum or comparison payload.

### Acceptance criteria

- [ ] Recording does not change player behavior.
- [ ] Device-specific button codes are absent from the authoritative timeline.
- [ ] A completed recording can be serialized to JSON.

## Phase 9 — Replay player

- [ ] Initialize the motion machine from the replay snapshot.
- [ ] Disable or isolate live gameplay input during replay.
- [ ] Dispatch recorded events at their original simulation ticks.
- [ ] Route replay events through the same motion machine as live events.
- [ ] Resolve animation presentation using the recorded catalog revision or a documented fallback.
- [ ] Add play, pause, restart, and playback-speed controls.
- [ ] Compare final replay state with the recorded final state.
- [ ] Report incompatible or invalid timelines clearly.

### Acceptance criteria

- [ ] Replaying the same timeline produces the same final motion snapshot.
- [ ] Replay playback does not require the original physical input device.
- [ ] A replay cannot mutate the stored source timeline.

## Phase 10 — Timeline and seeking

- [ ] Add a minimal visual timeline.
- [ ] Display semantic events and move labels.
- [ ] Add current tick, duration, and playback state.
- [ ] Add periodic replay checkpoints.
- [ ] Implement seeking by restoring the nearest checkpoint and replaying subsequent events.
- [ ] Add step-forward debugging by one simulation tick.
- [ ] Consider rewind only after checkpoint restore is stable.

### Acceptance criteria

- [ ] The user can inspect when each accepted move occurred.
- [ ] Seeking produces the same state as uninterrupted playback at the target tick.
- [ ] Timeline UI remains separate from the authoritative replay model.

## Phase 11 — Persistence and future API support

- [ ] Implement local replay import and export.
- [ ] Validate imported replay data before use.
- [ ] Define a `ReplayStorage` interface.
- [ ] Provide an in-memory or browser-local implementation first.
- [ ] Design an HTTP implementation without coupling it to gameplay.
- [ ] Add payload-size and event-count limits.
- [ ] Treat replay files and remote catalogs as untrusted input.
- [ ] Define migration or rejection behavior for older replay versions.

### Acceptance criteria

- [ ] Storage implementation can change without modifying motion logic.
- [ ] Invalid remote data cannot reach XState context unchecked.
- [ ] Local development does not require a backend.

## Test checklist

### Unit-level behavior

- [ ] Catalog validator accepts the default catalog.
- [ ] Catalog validator rejects invalid versions, duplicate IDs, and malformed playback data.
- [ ] Intent resolver emits correct press and release edges.
- [ ] Motion guards accept and reject the expected transitions.
- [ ] Pause and resume preserve the intended motion state.
- [ ] Replay validation rejects incompatible or malformed timelines.
- [ ] Recorder output is stable for the same accepted event sequence.
- [ ] Replay produces the recorded final snapshot.

### Integration behavior

- [ ] Keyboard movement and actions work.
- [ ] Touch movement and actions work.
- [ ] Gamepad movement and actions work.
- [ ] Switching active input source does not reset motion unexpectedly.
- [ ] Missing animation mappings use the fallback safely.
- [ ] Catalog loading failure remains recoverable.
- [ ] Pausing the game pauses authoritative motion and presentation.
- [ ] Live input cannot alter an active replay.

### Build verification

- [x] Run `npm run game:build` after every implementation phase.
- [ ] Run `npm run build` after changes to the website/game integration boundary.
- [x] Run `git diff --check` before completing each phase.

## Documentation checklist

- [ ] Update the [game scene architecture](./threejs-scene-architecture.md) after the new actor boundaries are implemented.
- [x] Update the repository [Input Manager documentation](../../../docs/input-manager.md) if the intent contract changes.
- [ ] Update the [project specification](../../../PROJECT_SPEC.md) when the runtime structure becomes active.
- [ ] Add replay format documentation before replay files become externally shareable.
- [ ] Keep this task list synchronized as tasks are completed or intentionally deferred.

## Deferred work

The following items are intentionally outside the first implementation:

- [ ] Network replay upload or sharing.
- [ ] Multiplayer rollback or lockstep simulation.
- [ ] Server-authoritative replay verification.
- [ ] Full skeletal-animation asset pipeline.
- [ ] Gameplay editor or animation editor.
- [ ] Advanced rewind before checkpoint-based seeking is proven.
- [ ] Replay compatibility across arbitrary gameplay-rule versions.

## Definition of done

- [ ] Player motion and animation playback have independent state machines.
- [ ] Animation definitions load through a replaceable, validated catalog source.
- [ ] Player intent is semantic and independent of input hardware and animation filenames.
- [ ] The renderer consumes decisions but does not own gameplay move selection.
- [ ] A live session can be recorded as a versioned deterministic event timeline.
- [ ] The recorded timeline can be replayed through the same motion machine.
- [ ] Replay final state matches the recorded final state for the supported prototype scope.
- [ ] All relevant builds and documentation checks pass.
