import { useEffect, type RefObject } from 'react';
import { create as createJoystick } from 'nipplejs';
import { useGameInputController } from './GameInputProvider';

interface TouchInputAdapterProps {
  joystickZoneRef: RefObject<HTMLDivElement | null>;
  channel: 'move' | 'look';
}

type JoystickMoveData = {
  vector?: {
    x?: number;
    y?: number;
  };
};

type JoystickManager = {
  on(event: 'move', handler: (event: unknown, data: JoystickMoveData) => void): void;
  on(event: 'end', handler: () => void): void;
  destroy(): void;
};

const touchDeadzone = 0.18;

function softenTouchVector(x: number, y: number) {
  const magnitude = Math.min(1, Math.hypot(x, y));
  if (magnitude <= touchDeadzone) return { x: 0, y: 0 };

  const response = Math.pow((magnitude - touchDeadzone) / (1 - touchDeadzone), 1.35);
  return {
    x: (x / magnitude) * response,
    y: (y / magnitude) * response
  };
}

export default function TouchInputAdapter({ joystickZoneRef, channel }: TouchInputAdapterProps) {
  const controller = useGameInputController();

  useEffect(() => {
    const zone = joystickZoneRef.current;
    if (!zone) return undefined;

    const manager = createJoystick({
      zone,
      mode: 'dynamic',
      size: 120,
      threshold: touchDeadzone
    }) as unknown as JoystickManager;

    const handleMove = (_event: unknown, data: JoystickMoveData) => {
      const x = data.vector?.x ?? 0;
      const y = data.vector?.y ?? 0;
      const vector = softenTouchVector(x, y);
      if (channel === 'move') controller.updateMove('touch', vector);
      else controller.updateLook('touch', vector);
    };

    const handleEnd = () => {
      if (channel === 'move') controller.updateMove('touch', { x: 0, y: 0 });
      else controller.updateLook('touch', { x: 0, y: 0 });
    };

    manager.on('move', handleMove);
    manager.on('end', handleEnd);

    return () => {
      handleEnd();
      manager.destroy();
    };
  }, [channel, controller, joystickZoneRef]);

  return null;
}
