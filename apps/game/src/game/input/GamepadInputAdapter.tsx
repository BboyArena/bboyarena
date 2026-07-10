import { useEffect } from 'react';
import { useGameInputController } from './GameInputProvider';
import { useGameStore } from '../state/useGameStore';
import { clampInputValue, normalizeInputVector, type GameInputVector } from './gameInputTypes';

const deadzone = 0.15;
const centerHoldGraceMs = 350;
const leftStickButtonIndex = 10;
const rightStickButtonIndex = 11;

function applyDeadzone(value: number) {
  const magnitude = Math.abs(value);
  if (magnitude < deadzone) return 0;

  const normalized = (magnitude - deadzone) / (1 - deadzone);
  return Math.sign(value) * clampInputValue(normalized, 0, 1);
}

function normalizeGamepadVector(vector: GameInputVector): GameInputVector {
  const nextVector = {
    x: applyDeadzone(vector.x),
    y: applyDeadzone(vector.y)
  };

  return normalizeInputVector(nextVector);
}

export default function GamepadInputAdapter() {
  const controller = useGameInputController();
  const selectedGamepadIndex = useGameStore((state) => state.selectedGamepadIndex);
  const gamepadInputMap = useGameStore((state) => state.gamepadInputMap);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return undefined;

    let frame = 0;
    let lastMoveActivityAt = Number.NEGATIVE_INFINITY;
    let lastLookActivityAt = Number.NEGATIVE_INFINITY;

    const poll = () => {
      const now = typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
      const gamepads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
      const gamepad = selectedGamepadIndex === null
        ? Array.from(gamepads).find(Boolean)
        : gamepads[selectedGamepadIndex];

      if (!gamepad || !('axes' in gamepad) || !('buttons' in gamepad)) {
        controller.resetSource('gamepad');
        frame = window.requestAnimationFrame(poll);
        return;
      }

      const move = normalizeGamepadVector({
        x: gamepad.axes[0] ?? 0,
        y: -(gamepad.axes[1] ?? 0)
      });
      const look = normalizeGamepadVector({
        x: gamepad.axes[2] ?? 0,
        y: -(gamepad.axes[3] ?? 0)
      });
      const hasMoveInput = Math.hypot(move.x, move.y) > 0;
      const hasLookInput = Math.hypot(look.x, look.y) > 0;
      if (hasMoveInput) lastMoveActivityAt = now;
      if (hasLookInput) lastLookActivityAt = now;

      const moveActive = hasMoveInput
        || Boolean(gamepad.buttons[leftStickButtonIndex]?.pressed)
        || now - lastMoveActivityAt <= centerHoldGraceMs;
      const lookActive = hasLookInput
        || Boolean(gamepad.buttons[rightStickButtonIndex]?.pressed)
        || now - lastLookActivityAt <= centerHoldGraceMs;

      controller.updateMove('gamepad', move, moveActive);
      controller.updateLook('gamepad', look, lookActive);

      Object.entries(gamepadInputMap).forEach(([buttonId, index]) => {
        const buttonState = gamepad.buttons[index];
        controller.updateButton('gamepad', buttonId as keyof typeof gamepadInputMap, Boolean(buttonState?.pressed), buttonState?.value ?? 0);
      });

      frame = window.requestAnimationFrame(poll);
    };

    frame = window.requestAnimationFrame(poll);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      controller.resetSource('gamepad');
    };
  }, [controller, gamepadInputMap, selectedGamepadIndex]);

  return null;
}
