import { useEffect, type RefObject } from 'react';
import { useGameInputController } from './GameInputProvider';

interface TouchInputAdapterProps {
  joystickZoneRef: RefObject<HTMLDivElement | null>;
  channel: 'move' | 'look';
}

const touchDeadzone = 0.18;
const knobDiameter = 46;

function softenTouchVector(x: number, y: number) {
  const magnitude = Math.min(1, Math.hypot(x, y));
  if (magnitude <= touchDeadzone) return { x: 0, y: 0 };
  const response = Math.pow((magnitude - touchDeadzone) / (1 - touchDeadzone), 1.35);
  return { x: (x / magnitude) * response, y: (y / magnitude) * response };
}

function resolveColor(strength: number) {
  if (strength <= 0.5) {
    const phase = strength / 0.5;
    return [
      Math.round(128 + (39 - 128) * phase),
      Math.round(211 + (240 - 211) * phase),
      Math.round(105 + (105 - 105) * phase)
    ];
  }
  const phase = (strength - 0.5) / 0.5;
  return [
    Math.round(39 + (235 - 39) * phase),
    Math.round(240 + (45 - 240) * phase),
    Math.round(105 + (35 - 105) * phase)
  ];
}

export default function TouchInputAdapter({ joystickZoneRef, channel }: TouchInputAdapterProps) {
  const controller = useGameInputController();

  useEffect(() => {
    const zone = joystickZoneRef.current;
    if (!zone) return undefined;
    let activePointerId: number | null = null;

    const updateController = (x: number, y: number) => {
      const vector = softenTouchVector(x, y);
      if (channel === 'move') controller.updateMove('touch', vector);
      else controller.updateLook('touch', vector);
    };

    const render = (x: number, y: number, strength: number) => {
      const [red, green, blue] = resolveColor(strength);
      const maxTravel = Math.max(1, (Math.min(zone.clientWidth, zone.clientHeight) - knobDiameter) / 2);
      zone.style.setProperty('--joystick-strength', strength.toFixed(3));
      zone.style.setProperty('--joystick-color', `rgb(${red}, ${green}, ${blue})`);
      zone.style.setProperty('--joystick-offset-x', `${x * strength * maxTravel}px`);
      zone.style.setProperty('--joystick-offset-y', `${-y * strength * maxTravel}px`);
      zone.dataset.joystickLevel = String(Math.round(strength * 100));
      zone.dataset.joystickMax = strength >= 0.985 ? 'true' : 'false';
    };

    const reset = () => {
      activePointerId = null;
      zone.dataset.joystickActive = 'false';
      zone.dataset.joystickMax = 'false';
      delete zone.dataset.joystickLevel;
      zone.style.setProperty('--joystick-strength', '0');
      zone.style.setProperty('--joystick-color', 'rgb(155, 119, 66)');
      zone.style.setProperty('--joystick-offset-x', '0px');
      zone.style.setProperty('--joystick-offset-y', '0px');
      updateController(0, 0);
    };

    const updateFromPointer = (event: PointerEvent) => {
      const rect = zone.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const maxTravel = Math.max(1, (Math.min(rect.width, rect.height) - knobDiameter) / 2);
      const distance = Math.hypot(dx, dy);
      const strength = Math.min(1, distance / maxTravel);
      const directionX = distance > 0 ? dx / distance : 0;
      const directionY = distance > 0 ? -dy / distance : 0;
      render(directionX, directionY, strength);
      updateController(directionX * strength, directionY * strength);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (activePointerId !== null) return;
      event.preventDefault();
      activePointerId = event.pointerId;
      zone.setPointerCapture(event.pointerId);
      zone.dataset.joystickActive = 'true';
      render(0, 0, 0);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return;
      event.preventDefault();
      updateFromPointer(event);
    };
    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return;
      event.preventDefault();
      reset();
    };

    zone.addEventListener('pointerdown', handlePointerDown);
    zone.addEventListener('pointermove', handlePointerMove);
    zone.addEventListener('pointerup', handlePointerEnd);
    zone.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      zone.removeEventListener('pointerdown', handlePointerDown);
      zone.removeEventListener('pointermove', handlePointerMove);
      zone.removeEventListener('pointerup', handlePointerEnd);
      zone.removeEventListener('pointercancel', handlePointerEnd);
      reset();
    };
  }, [channel, controller, joystickZoneRef]);

  return null;
}
