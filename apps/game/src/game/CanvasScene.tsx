import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Player from './Player';

interface CanvasSceneProps {
  gameState: string;
}

function GraffitiWall({
  position,
  rotation,
  width,
  height,
  depth = 0.2,
  tagColor = '#bc613a',
  blotColor = '#7e8c57'
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  depth?: number;
  tagColor?: string;
  blotColor?: string;
}) {
  return (
    <group position={position} rotation={rotation ?? [0, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#7d7468" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0, 0.12, depth / 2 + 0.01]} castShadow>
        <planeGeometry args={[width * 0.92, height * 0.76]} />
        <meshStandardMaterial color={tagColor} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[-width * 0.18, -height * 0.15, depth / 2 + 0.02]} castShadow>
        <boxGeometry args={[width * 0.16, height * 0.14, 0.03]} />
        <meshStandardMaterial color={blotColor} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[width * 0.2, height * 0.06, depth / 2 + 0.02]} castShadow>
        <boxGeometry args={[width * 0.22, height * 0.1, 0.03]} />
        <meshStandardMaterial color="#ead7bf" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.14, 0.42]} />
        <meshStandardMaterial color="#7d6147" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0, -0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 0.1, 0.28]} />
        <meshStandardMaterial color="#5a493b" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[-0.72, -0.55, 0.11]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.55, 0.08]} />
        <meshStandardMaterial color="#4d4035" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0.72, -0.55, 0.11]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.55, 0.08]} />
        <meshStandardMaterial color="#4d4035" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

function Boombox({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.45, 0.35]} />
        <meshStandardMaterial color="#3d342c" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[-0.24, 0, 0.18]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 16]} />
        <meshStandardMaterial color="#c8b69d" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0.24, 0, 0.18]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 16]} />
        <meshStandardMaterial color="#c8b69d" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0, 0.13, 0.18]} castShadow>
        <boxGeometry args={[0.3, 0.04, 0.04]} />
        <meshStandardMaterial color="#d9c9b1" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[0, 0, -0.25]} castShadow>
        <boxGeometry args={[0.65, 0.04, 0.04]} />
        <meshStandardMaterial color="#8ea14a" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

function Hoop({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.12, 2.4, 0.12]} />
        <meshStandardMaterial color="#5a4a3e" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0, 1.1, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.65, 0.06]} />
        <meshStandardMaterial color="#d6ccb9" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0.42, 0.72, -0.24]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <torusGeometry args={[0.17, 0.03, 8, 24]} />
        <meshStandardMaterial color="#bc613a" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

export default function CanvasScene({ gameState }: CanvasSceneProps) {
  return (
    <div className="game-canvas">
      <Canvas className="game-canvas__surface" shadows camera={{ position: [0, 3.1, 8.2], fov: 42 }} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#b6aa96']} />
        <fog attach="fog" args={['#b6aa96', 10, 28]} />

        <ambientLight intensity={0.72} color="#efe2ce" />
        <hemisphereLight intensity={0.9} color="#e9dcc6" groundColor="#5c5146" />

        <directionalLight
          position={[6, 9, 4]}
          intensity={gameState === 'playing' ? 1.4 : 1}
          color="#f1e0c5"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <pointLight position={[-4, 2.8, -1]} intensity={0.75} color="#8ea14a" />
        <pointLight position={[4, 2.5, 1]} intensity={0.55} color="#bc613a" />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#9d907d" roughness={1} metalness={0} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <ringGeometry args={[1.95, 2.45, 48]} />
          <meshStandardMaterial color="#8f6c44" roughness={1} metalness={0} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]} receiveShadow>
          <ringGeometry args={[1.6, 1.72, 48]} />
          <meshStandardMaterial color="#d9ccb3" roughness={1} metalness={0} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.031, 0]} receiveShadow>
          <ringGeometry args={[0.9, 1.0, 32]} />
          <meshStandardMaterial color="#d6a146" roughness={1} metalness={0} />
        </mesh>

        <GraffitiWall position={[0, 2.15, -8]} width={16} height={4.5} tagColor="#7f7468" blotColor="#bc613a" />
        <GraffitiWall position={[-8.2, 2.1, 0]} rotation={[0, Math.PI / 2, 0]} width={14} height={4.2} tagColor="#8a7f72" blotColor="#6f8050" />
        <GraffitiWall position={[8.2, 2.1, 0]} rotation={[0, -Math.PI / 2, 0]} width={14} height={4.2} tagColor="#897c6f" blotColor="#bc613a" />

        <Bench position={[-2.8, 0.23, -4.7]} />
        <Bench position={[3.5, 0.23, -5.2]} />
        <Boombox position={[-5.2, 0.23, 2.8]} />
        <Hoop position={[5.5, 0.02, -2.5]} />

        <mesh position={[0, 0.02, -0.08]} rotation={[-Math.PI / 2, 0.2, 0]} receiveShadow>
          <torusGeometry args={[0.55, 0.04, 10, 36]} />
          <meshStandardMaterial color="#4c4034" roughness={1} metalness={0} />
        </mesh>
        <mesh position={[0, 0.12, -0.08]} castShadow>
          <boxGeometry args={[0.45, 0.04, 0.45]} />
          <meshStandardMaterial color="#d9c7ae" roughness={1} metalness={0} />
        </mesh>

        <Player gameState={gameState} />

        <OrbitControls enablePan={false} minDistance={4.5} maxDistance={14} maxPolarAngle={Math.PI / 2.15} target={[0, 1.05, 0]} />
      </Canvas>
    </div>
  );
}
