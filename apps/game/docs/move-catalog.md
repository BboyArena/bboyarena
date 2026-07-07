# Move Catalog

This document describes the current authored move catalog, how it enters the standalone game runtime, and which catalog entries players can currently activate. It covers the synthetic prototype data shipped with the game; it does not describe production animation assets or a completed scoring system.

## Source of truth

The bundled move catalog is stored at:

```text
apps/game/src/game/move/data/moves.json
```

`moveCatalog.ts` imports this JSON and exposes it as a `MoveDefinitionCatalog`. The TypeScript contract lives in `moveDefinitionTypes.ts`.

The catalog and the animation catalog are separate:

- the move catalog describes gameplay timing, phases, cues, transitions, skills, and semantic stick guidance;
- `animation/data/animations.json` maps motion intent IDs to presentation definitions;
- the current local animations use `procedural://prototype-player`, so the catalog does not yet point to authored character animation files.

Both catalogs meet at the stable `intentId`. A move definition and its animation definition must use the same intent ID.

## Runtime flow

```text
physical input
→ canonical Toprock / Footwork / Freeze / Powermove button
→ GamePlayScene
→ MoveQueueController
→ move catalog lookup
→ player motion intent
→ animation catalog lookup
→ procedural player presentation
```

`GamePlayScene.tsx` observes rising button presses while the game is playing. `MoveQueueController` maps each canonical move-family button to its default intent, reads its label and beat duration from the move catalog, and either starts it immediately or puts it in the bounded queue.

The queue currently accepts up to eight waiting moves. An active move completes when the rhythm clock reaches its authored `durationBeats`; the next queued move then starts. Requests do not currently use the authored transition windows.

The Training HUD reads the same catalog to display the active move name, progress, queue, and sampled stick-cue guidance.

## Catalog shape

The root object contains:

| Field | Meaning |
| --- | --- |
| `version` | Schema version. Currently `1`. |
| `catalogId` | Stable identifier for this catalog. |
| `catalogRevision` | Revision of the catalog contents. |
| `moves` | Authored move definitions. |
| `variationSelection` | Optional recipes for resolving a family request into a specific variation. |

Each entry in `moves` contains:

| Field | Meaning |
| --- | --- |
| `id` | Stable move-definition identifier. |
| `version` | Version of the individual definition. |
| `intentId` | Runtime identity shared with motion and animation systems. |
| `label` | Human-readable diagnostic label. |
| `skills` | Semantic skills associated with the move. These are descriptive today. |
| `sourceFps` | Frame rate used when authoring frame-based timing. |
| `sourceFrameCount` | Total authored frame span. |
| `durationBeats` | Runtime duration measured by the global rhythm clock. |
| `loop` | Optional source-frame loop region. |
| `phases` | Named source-frame ranges such as entry, execution, hold, or recovery. |
| `cues` | Expected canonical actions and their early/late timing windows. |
| `stickCueTracks` | The two normalized directional guides authored for the move. |
| `transitions` | Authored windows in which another intent may follow. |

## Timing and normalization

Authored frames are portable timing coordinates rather than render frames. `normalizeMoveDefinition.ts` converts them using:

```text
beat = sourceFrame / sourceFrameCount × durationBeats
runtimeTicks = beat × (60 / BPM) × tickRate
```

This produces beat and fixed-step tick positions for loops, cues, and transition windows. It also derives an animation time scale from the authored duration and the musical runtime duration.

The normalization utilities exist, but the current queue only consumes `label` and `durationBeats`. Cue scoring, phase execution, and enforcement of transition windows are not yet connected to the active gameplay path.

## Two-stick movement grammar

Every move authors two cue tracks that run over the same move timeline:

- the **left stick** follows the `upper-body` track for torso and shoulder direction and maps to canonical `movement` input;
- the **right stick** follows the `lower-body` track for hip and leg direction and maps to canonical `look` input.

This is the base control grammar across Toprock, Footwork, Freeze, and Powermove. The paths change from move to move, but the body assignment stays stable so a first-time player does not have to relearn what each stick represents.

Each track describes its trajectory with normalized time and coordinates:

- `t` ranges from `0` to `1` over the move;
- `x` and `y` range from `-1` to `1`;
- `tolerance` optionally describes the accepted distance from a point;
- `controllerRole` is `upper-body` or `lower-body`;
- `targetInput` is `movement` for the upper-body track and `look` for the lower-body track;
- `loop` repeats the path for HUD sampling.

`stickCueTracks.ts` validates these tracks when the local catalog is imported. The Training HUD samples and draws both trajectories as guidance, including their current targets and the player's corresponding stick positions. It does not yet compare the paths with player input, fail a move, or award score.

## Current move inventory

| Label | Intent ID | Family | Duration | Runtime status |
| --- | --- | --- | ---: | --- |
| Default Toprock | `move.toprock.default` | Toprock | 4 beats | Activatable |
| Indian Step | `move.toprock.indianstep` | Toprock variation | 4 beats | Defined but unreachable |
| Default Footwork | `move.footwork.default` | Footwork | 4 beats | Activatable |
| Default Powermove | `move.powermove.default` | Powermove | 2 beats | Activatable |
| Default Freeze | `move.freeze.default` | Freeze | 4 beats | Activatable |

The four default moves are the currently functioning input-to-runtime paths. Each has a canonical button mapping, a queue mapping, a motion intent, and a local procedural animation definition.

Indian Step is present in the move and animation catalogs and is accepted by the player motion types. Its variation recipe opens with Toprock, then expects Freeze near beat offset `0.25` and Powermove near `0.5`, with `0.18` beat tolerance for each step. However, `PlayerIntentResolver` is not instantiated by `GamePlayScene`; the active queue always chooses the default intent for a family. Indian Step therefore cannot currently be selected through gameplay input.

## Authored data not yet enforced

The following fields are useful design data but are not fully executed by the current gameplay path:

- variation recipes;
- move phases;
- action cue timing and weights;
- transition windows;
- skill tags;
- stick-path accuracy and scoring;
- loop regions as animation playback instructions.

This distinction matters when adding content: a valid JSON entry is not automatically a playable move.

## Adding a playable move

Adding a new catalog record is only the data-authoring portion. A move is playable when all relevant runtime layers recognize it:

1. Add the move to `move/data/moves.json` with a unique `id` and `intentId`.
2. Add the intent ID and diagnostic label to `motion/playerMotionTypes.ts`.
3. Include the intent in the permitted move rules in `motion/playerMotionRules.ts`.
4. Add a matching animation definition to `animation/data/animations.json`, or ensure the configured remote animation catalog supplies one.
5. Add or extend input resolution so a player can produce that exact intent. The current queue supports only one hard-coded default intent per family.
6. Add any intent-specific player behavior only when the shared presentation is insufficient.
7. Verify the standalone game build and exercise the move through keyboard, gamepad, and touch paths where applicable.

When adding a variation, do not assume that a `variationSelection` recipe alone makes it reachable. The variation resolver must be integrated with the active queue/runtime policy first.

## Related files

- `apps/game/src/game/move/data/moves.json` — bundled catalog data.
- `apps/game/src/game/move/moveCatalog.ts` — catalog import boundary.
- `apps/game/src/game/move/moveDefinitionTypes.ts` — schema types.
- `apps/game/src/game/move/normalizeMoveDefinition.ts` — frame, beat, and tick normalization.
- `apps/game/src/game/move/stickCueTracks.ts` — stick-track validation and sampling.
- `apps/game/src/game/move/MoveQueueController.ts` — active default-family selection and queueing.
- `apps/game/src/game/motion/playerIntentResolver.ts` — currently disconnected variation recipe resolver.
- `apps/game/src/game/motion/playerMotionTypes.ts` — accepted intent IDs.
- `apps/game/src/game/animation/data/animations.json` — intent-to-animation definitions.
- `apps/game/src/game/GamePlayScene.tsx` — current runtime integration.

## Related documentation

- [Game scene and screen architecture](./threejs-scene-architecture.md)
- [Input Manager](../../../docs/input-manager.md)
- [Current repository architecture](../../../docs/current-architecture.md)
- [Project specification](../../../PROJECT_SPEC.md)
