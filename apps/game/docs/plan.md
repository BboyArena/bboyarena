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
| Phase 2 — Replaceable catalog loading | Not started | Depends on Phase 1. |
| Phase 3 — Player motion machine | Not started | Depends on stable motion contracts. |
| Phase 4 — Intent resolver | Not started | Depends on the motion event protocol. |
| Phase 5 — Animation playback machine | Not started | Depends on catalog loading. |
| Phase 6 — Runtime integration | Not started | Depends on motion and playback actors. |
| Phase 7 — Deterministic replay foundation | Not started | Depends on authoritative motion transitions. |
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

`GamePlayScene` currently derives move selection directly from held input, BPM, and the global game lifecycle. `Player` then combines gameplay interpretation with procedural presentation. The new contracts are isolated and do not change this runtime behavior yet.

The initial simulation rate is `60` ticks per second. This is a gameplay/replay clock decision and does not require the renderer to run at 60 frames per second.

Initial intent candidates:

```text
movement.idle
movement.toprock
move.spin.start
move.windmill
move.headspin
pose.freeze
```

### Acceptance criteria

- [x] Types distinguish input, gameplay motion, animation playback, and replay data.
- [x] No type references an animation filename as a gameplay decision.
- [x] The proposed contracts can represent the current idle, toprock, spin, and freeze behavior.

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
  "catalogRevision": "2026.07.1",
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

- [ ] Define an `AnimationCatalogSource` interface.
- [ ] Implement an asynchronous local JSON source.
- [ ] Design an HTTP source with the same interface.
- [ ] Support `AbortSignal` for canceled loads.
- [ ] Define loading, ready, and failure results.
- [ ] Provide a known local fallback when remote loading fails.
- [ ] Keep the selected source configurable at the game composition boundary.
- [ ] Avoid direct `fetch` calls inside gameplay or rendering components.

### Acceptance criteria

- [ ] Switching from local JSON to HTTP does not change motion-machine code.
- [ ] The game remains usable when the remote catalog is unavailable.
- [ ] Catalog revision information is available to the replay system.

## Phase 3 — Player motion machine

- [ ] Create a typed XState `playerMotionMachine`.
- [ ] Add the initial `inactive`, `grounded`, `performing`, and `paused` states.
- [ ] Add nested `idle` and `moving` grounded states where useful.
- [ ] Add `starting`, `active`, and `recovering` performing phases only when required by current moves.
- [ ] Move movement, facing, balance, and contact data into serializable context.
- [ ] Store the active semantic intent ID separately from animation state.
- [ ] Implement guards for allowed motion transitions.
- [ ] Implement interruption rules in motion code, not catalog data.
- [ ] Define reset, pause, resume, and disable behavior.
- [ ] Expose a small, typed motion snapshot to consumers.

### Acceptance criteria

- [ ] `PlayerMotionState` is no longer reconstructed ad hoc in `GamePlayScene`.
- [ ] The machine accepts the current input-driven behaviors.
- [ ] State snapshots contain no `THREE.Vector3`, meshes, clips, or mixers.
- [ ] The machine can be exercised without React or WebGL.

## Phase 4 — Intent resolver

- [ ] Create a pure resolver from canonical input snapshots to motion events.
- [ ] Emit continuous movement updates separately from discrete move requests.
- [ ] Detect button press and release edges.
- [ ] Prevent a held button from restarting the same move every render.
- [ ] Keep keyboard, touch, and gamepad behavior equivalent.
- [ ] Preserve the original input source for optional diagnostics only.
- [ ] Define behavior for conflicting simultaneous intents.

### Acceptance criteria

- [ ] Identical canonical input produces identical motion events across devices.
- [ ] Holding the primary action does not emit repeated start events.
- [ ] The resolver is a pure function or isolated controller that can be tested independently.

## Phase 5 — Animation playback machine

- [ ] Create a typed XState animation playback machine.
- [ ] Add catalog loading, ready, playing, transitioning, and failed behavior.
- [ ] Resolve accepted semantic intents through the loaded catalog.
- [ ] Emit animation started, completed, interrupted, and failed events.
- [ ] Define missing-animation fallback behavior.
- [ ] Add playback speed, looping, and fade metadata handling.
- [ ] Keep gameplay validity decisions outside this machine.
- [ ] Define how pause and resume affect the active playback.

### Acceptance criteria

- [ ] Motion state can exist and transition without an animation clip.
- [ ] Animation failure does not corrupt gameplay motion state.
- [ ] Changing a catalog mapping changes presentation without changing input or motion rules.

## Phase 6 — Runtime integration

- [ ] Instantiate the motion and animation actors at the gameplay composition boundary.
- [ ] Connect global game lifecycle events to motion and playback actors.
- [ ] Replace `GamePlayScene` motion-state `useMemo` construction.
- [ ] Pass a stable motion snapshot and playback command through `CanvasScene`.
- [ ] Remove move-selection decisions from `Player.tsx`.
- [ ] Convert serializable vectors to Three.js values only inside rendering code.
- [ ] Preserve the current procedural animation as a temporary fallback.
- [ ] Add diagnostic display for game state, motion state, active intent, and resolved animation.

### Acceptance criteria

- [ ] Existing idle, toprock, spin, pause, and freeze feedback still works.
- [ ] `Player.tsx` no longer decides which gameplay move is active.
- [ ] Website and game builds still succeed independently.

## Phase 7 — Deterministic replay foundation

- [ ] Implement a fixed-step replay clock.
- [ ] Define a versioned `PlayerReplay` format.
- [ ] Store format, gameplay-rules, and animation-catalog versions.
- [ ] Store tick rate, mode, BPM, selected character, and deterministic seed.
- [ ] Define the minimum serializable initial player snapshot.
- [ ] Define replay event types for accepted motion intents and lifecycle changes.
- [ ] Remove replay-sensitive dependencies on `Date.now()` and unseeded `Math.random()`.
- [ ] Keep rendering delta time outside authoritative replay decisions.

Suggested replay envelope:

```json
{
  "formatVersion": 1,
  "gameplayVersion": "0.0.1",
  "catalogRevision": "2026.07.1",
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

- [ ] Run `npm run game:build` after every implementation phase.
- [ ] Run `npm run build` after changes to the website/game integration boundary.
- [ ] Run `git diff --check` before completing each phase.

## Documentation checklist

- [ ] Update the [game scene architecture](./threejs-scene-architecture.md) after the new actor boundaries are implemented.
- [ ] Update the repository [Input Manager documentation](../../../docs/input-manager.md) if the intent contract changes.
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
