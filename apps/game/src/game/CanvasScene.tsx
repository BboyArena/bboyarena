import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Player from './Player';
import type { PlayerMotionSnapshot } from './motion/playerMotionTypes';
import type { AnimationDefinition } from './animation/animationCatalogTypes';

interface CanvasSceneProps {
  gameState: string;
  playerMotionState: PlayerMotionSnapshot;
  animationDefinition: AnimationDefinition | null;
  onPerformanceUpdate?: (diagnostics: RenderingDiagnostics) => void;
}

export type RenderingDiagnostics = {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
};

function PerformanceMonitor({ onUpdate }: { onUpdate?: (diagnostics: RenderingDiagnostics) => void }) {
  const gl = useThree((state) => state.gl);
  const sampleRef = useRef({ startedAt: performance.now(), frames: 0 });

  useFrame(() => {
    if (!onUpdate) return;

    const sample = sampleRef.current;
    sample.frames += 1;
    const now = performance.now();
    const elapsedMs = now - sample.startedAt;
    if (elapsedMs < 500) return;

    const fps = sample.frames * 1000 / elapsedMs;
    onUpdate({
      fps,
      frameTimeMs: fps > 0 ? 1000 / fps : 0,
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures
    });
    sample.startedAt = now;
    sample.frames = 0;
  });

  return null;
}

function ParquetFloor() {
  const parquetTexture = useTexture(`${import.meta.env.BASE_URL}parquet.png`);

  parquetTexture.colorSpace = THREE.SRGBColorSpace;
  parquetTexture.wrapS = THREE.RepeatWrapping;
  parquetTexture.wrapT = THREE.RepeatWrapping;
  parquetTexture.repeat.set(12, 12);
  parquetTexture.anisotropy = 4;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial map={parquetTexture} roughness={0.96} metalness={0.02} />
    </mesh>
  );
}

function WebGLContextGuard({ onContextLost }: { onContextLost: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost);
  }, [gl, onContextLost]);

  return null;
}

function CanvasScene({ gameState, playerMotionState, animationDefinition, onPerformanceUpdate }: CanvasSceneProps) {
  const [hasWebGLContext, setHasWebGLContext] = useState(true);
  const handleContextLost = useCallback(() => setHasWebGLContext(false), []);

  if (!hasWebGLContext) {
    return (
      <div className="game-canvas game-canvas--fallback" role="status">
        <strong>3D rendering paused</strong>
        <span>The device lost the WebGL context. Return to the menu and try again.</span>
      </div>
    );
  }

  return (
    <div className="game-canvas">
      <Canvas
        className="game-canvas__surface"
        shadows
        dpr={[1, 1.25]}
        camera={{ position: [0, 3.4, 8.5], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <WebGLContextGuard onContextLost={handleContextLost} />
        <PerformanceMonitor onUpdate={onPerformanceUpdate} />
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
        />
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
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-bias={-0.00008}
        />

        <ParquetFloor />

        <group position={[0, 0, 0]}>
          <Player
            gameState={gameState}
            playerMotionState={playerMotionState}
            animationDefinition={animationDefinition}
          />
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

function canvasScenePropsEqual(previous: CanvasSceneProps, next: CanvasSceneProps) {
  const previousMotion = previous.playerMotionState;
  const nextMotion = next.playerMotionState;
  return previous.gameState === next.gameState
    && previous.animationDefinition === next.animationDefinition
    && previous.onPerformanceUpdate === next.onPerformanceUpdate
    && previousMotion.activeIntentId === nextMotion.activeIntentId
    && previousMotion.balance === nextMotion.balance
    && previousMotion.rotationAxis.x === nextMotion.rotationAxis.x
    && previousMotion.rotationAxis.y === nextMotion.rotationAxis.y
    && previousMotion.rotationAxis.z === nextMotion.rotationAxis.z;
}

export default memo(CanvasScene, canvasScenePropsEqual);
