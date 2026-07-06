import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from './state/useGameStore';
import * as THREE from 'three';
import type { PlayerMotionSnapshot } from './motion/playerMotionTypes';
import type { AnimationDefinition } from './animation/animationCatalogTypes';

interface PlayerProps {
  gameState: string;
  playerMotionState: PlayerMotionSnapshot;
  animationDefinition: AnimationDefinition | null;
}

export default function Player({ gameState, playerMotionState, animationDefinition }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const selectedCharacter = useGameStore((state) => state.selectedCharacter);
  const bpm = useGameStore((state) => state.bpm);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const bps = bpm / 60;
    const rhythm = Math.sin(time * bps * Math.PI * 2);
    const { activeIntentId, balance, rotationAxis } = playerMotionState;
    const playbackSpeed = animationDefinition?.playback.speed ?? 1;
    const spinSpeed = (bpm / 34) * playbackSpeed;

    if (activeIntentId === 'move.freeze.default') {
      // Freeze state
      meshRef.current.position.y = 1 + Math.sin(time) * 0.08 * balance;
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.scale.set(1, 1, 1);
    } else if (gameState === 'playing') {
      // Dance moves: Spin, bounce and tilt matching the BPM
      const movePulse = activeIntentId === 'move.powermove.default' ? 1.12 : 1;
      const spinDirection = rotationAxis.y === 0 ? 1 : Math.sign(rotationAxis.y);
      meshRef.current.position.y = 1 + Math.abs(rhythm) * 0.8 * balance;
      meshRef.current.rotation.y = time * spinSpeed * spinDirection;
      meshRef.current.rotation.x = Math.sin(time * 2) * 0.3;
      meshRef.current.rotation.z = Math.cos(time * 2.5) * 0.3;

      const pulse = (1 + Math.abs(rhythm) * 0.12) * movePulse;
      meshRef.current.scale.set(pulse, pulse, pulse);
    } else if (gameState === 'paused') {
      // Freeze state
      meshRef.current.position.y = 1 + Math.sin(time) * 0.08 * balance;
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.scale.set(1, 1, 1);
    } else {
      // Idle breath bounce
      meshRef.current.position.y = 1 + Math.sin(time * 2) * 0.04 * balance;
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.rotation.x = 0;
      meshRef.current.rotation.z = 0;
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  const getColor = () => {
    switch (selectedCharacter) {
      case 'Brick Crew':
        return '#bc613a';
      case 'Lime Crew':
        return '#8da24f';
      case 'Dust Crew':
      default:
        return '#8f8579';
    }
  };

  return (
    <group>
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 18]} />
        <meshStandardMaterial color="#6d6053" roughness={1} metalness={0} />
      </mesh>

      {/* 3D Player Mesh */}
      <mesh ref={meshRef} position={[0, 1.08, 0]} castShadow>
        <capsuleGeometry args={[0.42, 1.15, 6, 12]} />
        <meshStandardMaterial
          color={getColor()}
          roughness={0.95}
          metalness={0.02}
          emissive={gameState === 'playing' ? getColor() : '#000000'}
          emissiveIntensity={gameState === 'playing' ? 0.08 : 0}
        />
      </mesh>

      <mesh position={[0, 1.95, 0.02]} castShadow>
        <boxGeometry args={[0.52, 0.5, 0.48]} />
        <meshStandardMaterial color="#d8ccb8" roughness={1} metalness={0} />
      </mesh>

      <mesh position={[0, 2.02, 0.28]}>
        <boxGeometry args={[0.44, 0.1, 0.08]} />
        <meshBasicMaterial color="#f0e7d7" />
      </mesh>

      <mesh position={[0, 1.45, 0.32]}>
        <boxGeometry args={[0.62, 0.1, 0.12]} />
        <meshStandardMaterial color="#41372f" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}
