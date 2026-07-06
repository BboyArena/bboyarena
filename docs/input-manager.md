# Input Manager

The game input system centralizes physical input and produces a normalized snapshot for gameplay. Gameplay code consumes canonical intent and does not need to know whether it came from a keyboard, mouse, gamepad, touch gesture, or virtual joystick.

## Source files

- [`InputManager.ts`](../apps/game/src/game/input/InputManager.ts) owns device listeners, polling, normalization, and subscriptions.
- [`GameInputProvider.tsx`](../apps/game/src/game/input/GameInputProvider.tsx) provides the manager to React.
- [`KeyboardMouseInputAdapter.tsx`](../apps/game/src/game/input/KeyboardMouseInputAdapter.tsx) maps keyboard and pointer input.
- [`GamepadInputAdapter.tsx`](../apps/game/src/game/input/GamepadInputAdapter.tsx) maps the browser Gamepad API.
- [`TouchInputAdapter.tsx`](../apps/game/src/game/input/TouchInputAdapter.tsx) maps touch controls and gestures.
- [`gameInputTypes.ts`](../apps/game/src/game/input/gameInputTypes.ts) defines the canonical gameplay-facing types.
- [`useInputStore.ts`](../apps/game/src/game/state/useInputStore.ts) exposes normalized input state through Zustand.

## Supported sources

### Keyboard and mouse

Keyboard movement is normalized so diagonal movement cannot exceed a magnitude of one. Logical actions are mapped from `KeyboardEvent.code`. Pointer dragging produces look intent, while pointer position remains available independently.

### Gamepad

The manager polls `navigator.getGamepads()` once per animation frame. Stick values pass through a configurable dead zone and are normalized. Button indices map to canonical actions, and connection metadata is exposed in each snapshot.

### Virtual joystick

`nipplejs` supplies touch movement through a configured joystick zone. The manager owns the joystick lifecycle and destroys it when stopped.

### Touch gestures

Touch input recognizes taps, double taps, swipes, and pinches. Gesture records contain positions, deltas, distance, scale where relevant, and a timestamp.

For development on a device that does not naturally expose touch controls, open the game with `?touchControls=1`.

## Snapshot shape

An input snapshot contains:

- normalized movement and look vectors;
- pointer position;
- active canonical actions;
- active input sources;
- connected gamepads;
- the latest gesture;
- a timestamp.

Snapshots are immutable from the consumer's point of view. Consumers subscribe to updates rather than reading browser APIs directly.

## Source resolution

The game resolves an active source from recent and available input. Device adapters translate hardware-specific events into the same canonical contract. Switching devices must not require gameplay changes.

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
