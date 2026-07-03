import * as THREE from 'three';

export type PlayerMoveId =
  | 'idle'
  | 'toprock'
  | 'spinStart'
  | 'windmill'
  | 'headspin'
  | 'freeze';

export type PlayerMotionState = {
  moveIntent: {
    x: number;
    y: number;
  };
  rotationAxis: THREE.Vector3;
  spinSpeed: number;
  balance: number;
  contactPoint: THREE.Vector3 | null;
  currentMove: PlayerMoveId;
};

export function createDefaultPlayerMotionState(): PlayerMotionState {
  return {
    moveIntent: { x: 0, y: 0 },
    rotationAxis: new THREE.Vector3(0, 1, 0),
    spinSpeed: 0,
    balance: 1,
    contactPoint: null,
    currentMove: 'idle'
  };
}
