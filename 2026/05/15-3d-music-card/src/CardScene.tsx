import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { useDialKit } from "dialkit";

const MODEL_URL = "/models/Lovable-card.glb";
const TARGET_MAX_DIM = 2.2;

// Brand accent colors
const DEFAULT_PURPLE = "#9B5DE5";
const DEFAULT_PINK = "#FF2D78";
const DEFAULT_WARM = "#FF8C42";

// Static color targets (avoid allocations in render)
const BG_IDLE = new THREE.Color("#0a0a0a");
const BG_ACTIVE = new THREE.Color("#12001f");
const EMISSIVE_IDLE = new THREE.Color("#000000");
const EMISSIVE_ACTIVE = new THREE.Color("#3a0f6e");

useGLTF.preload(MODEL_URL);

function fitModelToScene(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) root.scale.setScalar(TARGET_MAX_DIM / maxDim);
  root.updateMatrixWorld(true);
  const center = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
  root.position.sub(center);
}

function tuneMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of materials) {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.envMapIntensity = 1.4;
        mat.needsUpdate = true;
      }
    }
  });
}

// ---

function SceneBackground({ active }: { active: boolean }) {
  const { scene } = useThree();
  const bgColor = useRef(new THREE.Color("#0a0a0a"));

  useFrame((_, delta) => {
    const rate = 1 - Math.pow(0.04, delta);
    bgColor.current.lerp(active ? BG_ACTIVE : BG_IDLE, rate);
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(bgColor.current);
    } else {
      scene.background = bgColor.current.clone();
    }
  });

  return null;
}

function ExposureControl({ exposure }: { exposure: number }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);
  return null;
}

type AccentLightsProps = {
  active: boolean;
  purpleColor: string;
  pinkColor: string;
  warmColor: string;
  intensityMult: number;
};

function AccentLights({ active, purpleColor, pinkColor, warmColor, intensityMult }: AccentLightsProps) {
  const purpleRef = useRef<THREE.PointLight>(null);
  const pinkRef = useRef<THREE.PointLight>(null);
  const warmRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const rate = 1 - Math.pow(0.04, delta);
    const mult = active ? intensityMult : 0;

    if (purpleRef.current) {
      purpleRef.current.intensity = THREE.MathUtils.lerp(purpleRef.current.intensity, mult * 4.5, rate);
      purpleRef.current.color.set(purpleColor);
    }
    if (pinkRef.current) {
      pinkRef.current.intensity = THREE.MathUtils.lerp(pinkRef.current.intensity, mult * 3.5, rate);
      pinkRef.current.color.set(pinkColor);
    }
    if (warmRef.current) {
      warmRef.current.intensity = THREE.MathUtils.lerp(warmRef.current.intensity, mult * 2.5, rate);
      warmRef.current.color.set(warmColor);
    }
  });

  return (
    <>
      {/* Purple: top-left back — rim/fill */}
      <pointLight ref={purpleRef} position={[-3.5, 4, -1.5]} intensity={0} decay={2} />
      {/* Pink: right front — key accent */}
      <pointLight ref={pinkRef} position={[4, 0.5, 3]} intensity={0} decay={2} />
      {/* Warm: bottom front — bounce fill */}
      <pointLight ref={warmRef} position={[0, -3, 3.5]} intensity={0} decay={2} />
    </>
  );
}

type CardProps = { active: boolean };

function Card({ active }: CardProps) {
  const { scene } = useGLTF(MODEL_URL);
  const fitted = useRef(false);
  const meshMats = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    if (fitted.current) return;
    fitModelToScene(scene);
    tuneMaterials(scene);
    fitted.current = true;

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) {
        if (mat instanceof THREE.MeshStandardMaterial) meshMats.current.push(mat);
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    const rate = 1 - Math.pow(0.04, delta);
    const targetIntensity = active ? 0.3 : 0;
    for (const mat of meshMats.current) {
      mat.emissive.lerp(active ? EMISSIVE_ACTIVE : EMISSIVE_IDLE, rate);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, rate);
    }
  });

  return <primitive object={scene} />;
}

// ---

const SCENE_CONFIG = {
  Lighting: {
    ambient: [0, 2, 0.01, 0.55] as [number, number, number, number],
    hemisphere: [0, 1.5, 0.01, 0.45] as [number, number, number, number],
    key: [0, 6, 0.05, 2.2] as [number, number, number, number],
    fill: [0, 3, 0.05, 0.9] as [number, number, number, number],
    exposure: [0.5, 2.5, 0.05, 1.15] as [number, number, number, number],
  },
  Accents: {
    purple: { type: "color" as const, default: DEFAULT_PURPLE },
    pink: { type: "color" as const, default: DEFAULT_PINK },
    warm: { type: "color" as const, default: DEFAULT_WARM },
    intensity: [0, 3, 0.05, 1.0] as [number, number, number, number],
  },
};

type CardSceneProps = { active: boolean };

export function CardScene({ active }: CardSceneProps) {
  const controls = useDialKit("Scene", SCENE_CONFIG);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.15, 4.2], fov: 40, near: 0.01, far: 100 }}
      className="touch-none"
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = SCENE_CONFIG.Lighting.exposure[3];
      }}
    >
      <SceneBackground active={active} />
      <ExposureControl exposure={controls.Lighting.exposure} />

      {/* Base lighting — tweakable via DialKit */}
      <ambientLight intensity={controls.Lighting.ambient} />
      <hemisphereLight
        intensity={controls.Lighting.hemisphere}
        color="#f0f4ff"
        groundColor="#141414"
      />
      <directionalLight
        position={[5, 8, 6]}
        intensity={controls.Lighting.key}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 3, -3]} intensity={controls.Lighting.fill} />
      <pointLight position={[0, 2, 4]} intensity={0.6} />

      {/* Color accent lights — animate in on active */}
      <AccentLights
        active={active}
        purpleColor={controls.Accents.purple}
        pinkColor={controls.Accents.pink}
        warmColor={controls.Accents.warm}
        intensityMult={controls.Accents.intensity}
      />

      <Suspense
        fallback={
          <Html center>
            <p className="text-sm text-neutral-400">Loading card…</p>
          </Html>
        }
      >
        <Card active={active} />
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
