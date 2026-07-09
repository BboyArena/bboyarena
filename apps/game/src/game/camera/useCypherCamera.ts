import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlayerMotionSnapshot } from '../motion/playerMotionTypes';
import {
  CAMERA_FEEL_SETTINGS,
  isCameraFreezeMoment,
  resolveCameraMoveIntensity,
  resolveDynamicCameraProfile
} from './cameraFeel';

interface UseCypherCameraOptions {
  bpm: number;
  gameState: string;
  playerMotionState: PlayerMotionSnapshot;
}

function smoothNoise(time: number, seed: number) {
  return (
    Math.sin(time * 0.73 + seed * 1.91) * 0.52
    + Math.sin(time * 1.31 + seed * 4.17) * 0.31
    + Math.sin(time * 2.07 + seed * 0.67) * 0.17
  );
}

function easeInOutSine(value: number) {
  return 0.5 - Math.cos(Math.max(0, Math.min(1, value)) * Math.PI) * 0.5;
}

function steppedHeadBob(beat: number) {
  const phase = ((beat % 1) + 1) % 1;
  const hold = 0.09;

  if (phase < hold) return 1;
  if (phase < 0.5) {
    const progress = easeInOutSine((phase - hold) / (0.5 - hold));
    return 1 - progress * 2;
  }
  if (phase < 0.5 + hold) return -1;

  const progress = easeInOutSine((phase - 0.5 - hold) / (0.5 - hold));
  return -1 + progress * 2;
}

function resolveFreezeHoldAmount(elapsedTime: number, holdUntil: number) {
  const remaining = holdUntil - elapsedTime;
  if (remaining <= 0) return 0;

  return easeInOutSine(Math.min(1, remaining / 0.5));
}

export function useCypherCamera({ bpm, gameState, playerMotionState }: UseCypherCameraOptions) {
  const camera = useThree((state) => state.camera);
  const targetPositionRef = useRef(new THREE.Vector3());
  const lookTargetRef = useRef(new THREE.Vector3());
  const basePositionRef = useRef(new THREE.Vector3());
  const baseTargetRef = useRef(new THREE.Vector3());
  const lastIntentIdRef = useRef<PlayerMotionSnapshot['activeIntentId']>(null);
  const freezeHoldUntilRef = useRef(0);
  const freezePositionRef = useRef(new THREE.Vector3());
  const freezeTargetRef = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const elapsedTime = state.clock.getElapsedTime();
    const activeIntentId = playerMotionState.activeIntentId;
    if (activeIntentId !== lastIntentIdRef.current) {
      if (isCameraFreezeMoment(playerMotionState)) {
        freezeHoldUntilRef.current = elapsedTime + 0.5;
        freezePositionRef.current.copy(camera.position);
        freezeTargetRef.current.copy(lookTargetRef.current);
      }
      lastIntentIdRef.current = activeIntentId;
    }

    const dynamicProfile = resolveDynamicCameraProfile(playerMotionState);
    const settings = CAMERA_FEEL_SETTINGS[dynamicProfile];
    basePositionRef.current.fromArray(settings.basePosition);
    baseTargetRef.current.fromArray(settings.target);
    const safeBpm = Number.isFinite(bpm) && bpm > 0 ? bpm : 110;
    const beat = elapsedTime * safeBpm / 60;
    const headBob = -steppedHeadBob(beat);
    const moveIntensity = resolveCameraMoveIntensity(gameState, playerMotionState);
    const freezeHoldAmount = resolveFreezeHoldAmount(elapsedTime, freezeHoldUntilRef.current);
    const freezeStabilizer = isCameraFreezeMoment(playerMotionState) ? 0.42 : 1;
    const stateEnergy = gameState === 'playing' ? 1 : gameState === 'paused' ? 0.12 : 0.34;
    const motionAccent = 0.86 + moveIntensity * 0.22;
    const energy = stateEnergy * freezeStabilizer * (1 - freezeHoldAmount);
    const bobEnergy = energy * motionAccent;
    const position = targetPositionRef.current.copy(basePositionRef.current);
    const target = lookTargetRef.current.copy(baseTargetRef.current);
    const lateralWave = Math.sin(beat * Math.PI + 0.4);
    const depthWave = Math.sin(beat * Math.PI * 0.5 + 0.8);
    const orbitWave = Math.sin(beat * Math.PI * 0.35);
    const noiseX = smoothNoise(elapsedTime, 1);
    const noiseY = smoothNoise(elapsedTime, 2);
    const noiseZ = smoothNoise(elapsedTime, 3);
    const pushIn = settings.movePushIn * moveIntensity * energy;

    position.x += lateralWave * settings.lateralAmount * energy;
    position.y += headBob * settings.verticalAmount * bobEnergy + noiseY * settings.noiseAmount * 0.35 * energy;
    position.z += depthWave * settings.depthAmount * 0.65 * energy - pushIn;
    position.x += noiseX * settings.noiseAmount * 0.75 * energy;
    position.z += noiseZ * settings.noiseAmount * 0.45 * energy;

    position.x += orbitWave * settings.orbitAmount * energy;

    if (playerMotionState.activeIntentId === 'move.powermove.default') {
      position.x += Math.sin(beat * Math.PI * 0.75) * settings.orbitAmount * 0.7 * energy;
      position.z -= settings.movePushIn * 0.45 * energy;
    }

    if (freezeHoldAmount > 0) {
      position.lerp(freezePositionRef.current, freezeHoldAmount);
      target.lerp(freezeTargetRef.current, freezeHoldAmount);
    }

    const lerpSpeed = settings.lerpSpeed + freezeHoldAmount * 4;
    const lerpAlpha = 1 - Math.exp(-lerpSpeed * delta);
    camera.position.lerp(position, lerpAlpha);

    if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - settings.fov) > 0.01) {
      camera.fov += (settings.fov - camera.fov) * lerpAlpha;
      camera.updateProjectionMatrix();
    }

    camera.lookAt(target);
  });
}

export default function CypherCameraRig(props: UseCypherCameraOptions) {
  useCypherCamera(props);
  return null;
}
