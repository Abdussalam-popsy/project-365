import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { CarouselControls } from "../config/carouselDial";
import type { PointerState } from "../hooks/usePointerTilt";
import { CameraRig, CardRing } from "./CardRing";

type CarouselSceneProps = {
  controls: CarouselControls;
  scrollProgress: React.RefObject<number>;
  pointer: React.RefObject<PointerState>;
  reducedMotion: React.RefObject<boolean>;
};

export function CarouselScene({
  controls,
  scrollProgress,
  pointer,
  reducedMotion,
}: CarouselSceneProps) {
  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={[1, 2]}
      camera={{
        position: [0, 0, controls.Camera.distance],
        fov: controls.Camera.fov,
        near: 0.1,
        far: 100,
      }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 4, 6]} intensity={0.25} />

      <CardRing
        controls={controls}
        scrollProgress={scrollProgress}
        pointer={pointer}
        reducedMotion={reducedMotion}
      />
      <CameraRig controls={controls} pointer={pointer} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
