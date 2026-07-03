import { useEffect, type RefObject } from 'react';
import { create as createJoystick, type Collection } from 'nipplejs';
import { useGameInputController } from './GameInputProvider';

interface TouchInputAdapterProps {
  joystickZoneRef: RefObject<HTMLDivElement | null>;
}

type JoystickMoveData = {
  vector?: {
    x?: number;
    y?: number;
  };
};

export default function TouchInputAdapter({ joystickZoneRef }: TouchInputAdapterProps) {
  const controller = useGameInputController();

  useEffect(() => {
    const zone = joystickZoneRef.current;
    if (!zone) return undefined;

    const manager: Collection = createJoystick({
      zone,
      mode: 'dynamic',
      size: 120,
      threshold: 0.12
    });

    const handleMove = (_event: unknown, data: JoystickMoveData) => {
      const x = data.vector?.x ?? 0;
      const y = data.vector?.y ?? 0;
      controller.updateMove('touch', { x, y });
    };

    const handleEnd = () => {
      controller.resetSource('touch');
    };

    manager.on('move', handleMove);
    manager.on('end', handleEnd);

    return () => {
      controller.resetSource('touch');
      manager.destroy();
    };
  }, [controller, joystickZoneRef]);

  return null;
}
