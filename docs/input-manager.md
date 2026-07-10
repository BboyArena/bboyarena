# Input Manager

The game input system centralizes physical input and produces a normalized snapshot for gameplay. Gameplay code consumes canonical intent and does not need to know whether it came from a keyboard, mouse, gamepad, touch gesture, or virtual joystick.

## Source files

- [`GameInputController.ts`](../apps/game/src/game/input/GameInputController.ts) owns the normalized snapshot and subscriptions.
- [`GameInputProvider.tsx`](../apps/game/src/game/input/GameInputProvider.tsx) provides the manager to React.
- [`KeyboardMouseInputAdapter.tsx`](../apps/game/src/game/input/KeyboardMouseInputAdapter.tsx) maps keyboard and pointer input.
- [`GamepadInputAdapter.tsx`](../apps/game/src/game/input/GamepadInputAdapter.tsx) maps the browser Gamepad API.
- [`TouchInputAdapter.tsx`](../apps/game/src/game/input/TouchInputAdapter.tsx) maps touch controls and gestures.
- [`gameInputTypes.ts`](../apps/game/src/game/input/gameInputTypes.ts) defines the canonical gameplay-facing types.
- [`useGameStore.ts`](../apps/game/src/game/state/useGameStore.ts) stores device preferences and configurable bindings.

## Supported sources

### Keyboard and mouse

Keyboard movement is normalized so diagonal movement cannot exceed a magnitude of one. Logical actions are mapped from `KeyboardEvent.code`. Pointer dragging produces look intent, while pointer position remains available independently.

The default gameplay bindings are:

| Intent | Keyboard input |
| --- | --- |
| Movement directions | `W A S D` or arrow keys |
| Toprock | `J` |
| Footwork | `K` |
| Freeze | `L` |
| Powermove | `Space` |

Move documentation uses these same defaults when Keyboard & Mouse is selected. A directional sequence is entered with `W A S D` or the equivalent arrow keys; diagonal directions require both component keys together.

### Gamepad

The manager polls `navigator.getGamepads()` once per animation frame. Stick values pass through a configurable dead zone and are normalized. Button indices map to canonical actions, and connection metadata is exposed in each snapshot.

### Touch controller

The overlay provides a D-pad, two virtual analog sticks, ABXY, L1/L2/R1/R2, Options, and Esc. Pointer Events supply independent movement and look vectors from the two stick zones. Pointer capture plus cancellation, lost-capture, page visibility, and focus cleanup keep releases reliable during multi-touch input.

Move guidance gives those canonical vectors a stable body meaning: the left stick's `movement` vector follows the `upper-body` trajectory for torso and shoulders, while the right stick's `look` vector follows the `lower-body` trajectory for hips and legs. Every authored move supplies both trajectories.

ABXY are presentation labels for the four semantic move families: A maps to Toprock, B to Footwork, X to Freeze, and Y to Powermove. The move resolver never depends on the displayed controller label.

For development on a device that does not naturally expose touch controls, open the game with `?touchControls=1`.

## Snapshot shape

An input snapshot contains:

- normalized movement and look vectors;
- active flags for movement and look channels, so a held neutral stick can differ from released input. Touch sticks use pointer contact; gamepad sticks use per-stick evidence from axis movement, stick-click, or a short return-to-center grace window;
- canonical button states for move families, shoulders, and system controls;
- the most recently active input source;
- a timestamp.

Snapshots are immutable from the consumer's point of view. Consumers subscribe to updates rather than reading browser APIs directly.

## Source resolution

In automatic mode the game listens to keyboard, gamepad, and available touch controls together. Meaningful input selects the active source; neutral polling from another device cannot steal it. Explicit device preferences limit the active adapters. Device adapters translate hardware-specific events into the same canonical contract, so switching devices does not require gameplay changes.

The current gameplay consumes the four move-family buttons and contextual start/pause actions. The Training HUD reads both movement and look vectors to show them beside the two authored stick targets. This is visual guidance only: stick-path accuracy does not yet change motion, fail a move, or award score. Shoulder inputs remain part of the canonical diagnostic contract without triggering a gameplay action.

## Integration rules

1. Device-specific APIs stay inside `apps/game/src/game/input/`.
2. Add or change logical actions in the canonical type boundary before wiring a device mapping.
3. Gameplay components consume intent, never raw key codes, button indices, or touch events.
4. Start and stop listeners through the provider lifecycle to avoid duplicate subscriptions.
5. Keep dead-zone, sensitivity, and mapping changes configurable where the existing API supports them.
6. Preserve keyboard, touch, and gamepad parity when adding a gameplay action.

## Related documentation

- [Game scene architecture](../apps/game/docs/threejs-scene-architecture.md)
- [Game application README](../apps/game/README.md)
- [Current repository architecture](./current-architecture.md)
