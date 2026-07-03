import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Player from './Player';
import type { PlayerMotionState } from './state/playerMotionState';

interface CanvasSceneProps {
  gameState: string;
  playerMotionState: PlayerMotionState;
}

function ParquetFloor() {
  const parquetTexture = useTexture('/parquet.png');

  parquetTexture.colorSpace = THREE.SRGBColorSpace;
  parquetTexture.wrapS = THREE.RepeatWrapping;
  parquetTexture.wrapT = THREE.RepeatWrapping;
  parquetTexture.repeat.set(12, 12);
  parquetTexture.anisotropy = 16;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial map={parquetTexture} roughness={0.96} metalness={0.02} />
    </mesh>
  );
}

export default function CanvasScene({ gameState, playerMotionState }: CanvasSceneProps) {
  return (
    <div className="game-canvas">
      <Canvas
        className="game-canvas__surface"
        shadows
        camera={{ position: [0, 3.4, 8.5], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#070503']} />
        <fog attach="fog" args={['#070503', 6, 22]} />

        <ambientLight intensity={0.32} color="#756047" />
        <hemisphereLight intensity={0.28} color="#ae8452" groundColor="#1a110b" />
        <directionalLight
          position={[0, 3.5, 8]}
          intensity={0.32}
          color="#ffd9b1"
        />
        <directionalLight
          position={[6, 10, 5]}
          intensity={0.3}
          color="#ffe1bb"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 2.6, -3]} intensity={0.08} color="#3d2a16" />
        <pointLight position={[4, 1.8, 4]} intensity={0.22} color="#9b6a32" />
        <pointLight position={[0, 4, 3]} intensity={0.34} color="#c48d52" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={0.85}
          intensity={30}
          distance={30}
          decay={1}
          color="#fff1d6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.00008}
        />

        <ParquetFloor />

        <group position={[0, 0, 0]}>
          <Player gameState={gameState} playerMotionState={playerMotionState} />
        </group>

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={5}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.15}
          target={[0, 1.05, 0]}
        />
      </Canvas>
    </div>
  );
}
