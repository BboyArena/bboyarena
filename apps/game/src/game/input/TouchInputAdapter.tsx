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

export default function TouchInputAdapter({ joystickZoneRef, channel }: TouchInputAdapterProps) {
  const controller = useGameInputController();

  useEffect(() => {
    const zone = joystickZoneRef.current;
    if (!zone) return undefined;

    const manager = createJoystick({
      zone,
      mode: 'dynamic',
      size: 120,
      threshold: 0.12
    }) as unknown as JoystickManager;

    const handleMove = (_event: unknown, data: JoystickMoveData) => {
      const x = data.vector?.x ?? 0;
      const y = data.vector?.y ?? 0;
      const vector = { x, y };
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
