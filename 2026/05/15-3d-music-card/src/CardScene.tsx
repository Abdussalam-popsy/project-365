import { Suspense, useEffect, useRef } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/Lovable-card.glb";
/** Credit-card-sized in Three.js units (meters-ish). */
const TARGET_MAX_DIM = 2.2;

useGLTF.preload(MODEL_URL);

function fitModelToScene(root: THREE.Object3D) {
  root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  if (maxDim > 0) {
    root.scale.setScalar(TARGET_MAX_DIM / maxDim);
  }

  root.updateMatrixWorld(true);
  const fitted = new THREE.Box3().setFromObject(root);
  const center = fitted.getCenter(new THREE.Vector3());
  root.position.sub(center);
}

function tuneMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.castShadow = true;
    child.receiveShadow = true;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const mat of materials) {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.envMapIntensity = 1.4;
        mat.needsUpdate = true;
      }
    }
  });
}

type CardProps = {
  playing: boolean;
  onToggle: () => void;
};

function Card({ playing, onToggle }: CardProps) {
  const { scene } = useGLTF(MODEL_URL);
  const baseEmissive = useRef(new Map<THREE.Material, number>());
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current) return;
    fitModelToScene(scene);
    tuneMaterials(scene);
    fitted.current = true;
  }, [scene]);

  useEffect(() => {
    const saved = baseEmissive.current;
    saved.clear();

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      for (const mat of materials) {
        if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
        saved.set(mat, mat.emissiveIntensity);
      }
    });
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      for (const mat of materials) {
        if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
        const base = baseEmissive.current.get(mat) ?? mat.emissiveIntensity;
        mat.emissiveIntensity = playing ? Math.max(base, 0.35) : base;
      }
    });
  }, [playing, scene]);

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    onToggle();
  }

  return <primitive object={scene} onClick={handleClick} />;
}

type CardSceneProps = {
  playing: boolean;
  onToggle: () => void;
};

export function CardScene({ playing, onToggle }: CardSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.15, 4.2], fov: 40, near: 0.01, far: 100 }}
      className="touch-none"
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <color attach="background" args={["#0a0a0a"]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight
        intensity={0.45}
        color="#f0f4ff"
        groundColor="#141414"
      />
      <directionalLight
        position={[5, 8, 6]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 3, -3]} intensity={0.9} />
      <pointLight position={[0, 2, 4]} intensity={0.6} />

      <Suspense
        fallback={
          <Html center>
            <p className="text-sm text-neutral-400">Loading card…</p>
          </Html>
        }
      >
        <Card playing={playing} onToggle={onToggle} />
        <Environment preset="studio" environmentIntensity={1.1} />
        <ContactShadows
          position={[0, -0.72, 0]}
          opacity={0.5}
          scale={8}
          blur={2.5}
          far={3}
        />
      </Suspense>

      <OrbitControls
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={1.8}
        maxDistance={12}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.25}
        dampingFactor={0.06}
        enableDamping
      />
    </Canvas>
  );
}
