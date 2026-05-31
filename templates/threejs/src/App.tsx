import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <OrbitControls />
    </>
  );
}

export default function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
