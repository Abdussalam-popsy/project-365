import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CarouselControls } from "../config/carouselDial";
import { CARDS } from "../data/cards";
import { getCylinderSlot } from "../utils/cylinderLayout";
import type { PointerState } from "../hooks/usePointerTilt";
import { CarouselCard } from "./CarouselCard";

type CardRingProps = {
  controls: CarouselControls;
  scrollProgress: React.RefObject<number>;
  pointer: React.RefObject<PointerState>;
  reducedMotion: React.RefObject<boolean>;
};

export function CardRing({
  controls,
  scrollProgress,
  pointer,
  reducedMotion,
}: CardRingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const baseAngle = useRef(0);
  const smoothPointer = useRef({ x: 0, y: 0, intensity: 0 });
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const cardCount = Math.round(controls.Cylinder.cardCount);
  const depth = {
    scaleMin: controls.Depth.scaleMin,
    backOpacity: controls.Depth.backOpacity,
    frontOpacity: controls.Depth.frontOpacity,
    opacityFalloff: controls.Depth.opacityFalloff,
  };

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const rate = 1 - Math.pow(controls.Scroll.smoothness, delta);
    const targetAngle =
      scrollProgress.current *
      Math.PI *
      2 *
      controls.Scroll.loops *
      controls.Scroll.speed;
    baseAngle.current = THREE.MathUtils.lerp(baseAngle.current, targetAngle, rate);

    const ptr = pointer.current;
    const motionOff = reducedMotion.current;
    const targetIntensity = motionOff ? 0 : ptr.intensity;

    smoothPointer.current.intensity = THREE.MathUtils.lerp(
      smoothPointer.current.intensity,
      targetIntensity,
      rate,
    );
    smoothPointer.current.x = THREE.MathUtils.lerp(
      smoothPointer.current.x,
      motionOff ? 0 : ptr.x * smoothPointer.current.intensity,
      rate,
    );
    smoothPointer.current.y = THREE.MathUtils.lerp(
      smoothPointer.current.y,
      motionOff ? 0 : ptr.y * smoothPointer.current.intensity,
      rate,
    );

    const tilt = smoothPointer.current.intensity;
    group.position.x = controls.Cylinder.offsetX;
    group.rotation.y = smoothPointer.current.x * controls.Pointer.tiltY * tilt;
    group.rotation.z = -smoothPointer.current.x * controls.Pointer.tiltZ * tilt;
    group.rotation.x = smoothPointer.current.y * controls.Pointer.tiltX * tilt;

    const { radius } = controls.Cylinder;

    for (let index = 0; index < cardCount; index++) {
      const slot = getCylinderSlot(index, cardCount, radius, baseAngle.current, depth);
      const wrapper = group.children[index];
      if (!wrapper) continue;

      wrapper.position.copy(slot.position);
      wrapper.rotation.copy(slot.rotation);
      wrapper.scale.setScalar(slot.scale);

      const mesh = meshRefs.current[index];
      if (mesh) {
        mesh.renderOrder = Math.round(((slot.position.z + radius) / (2 * radius)) * 100);
      }

      const material = mesh?.material;
      if (material && !Array.isArray(material) && "opacity" in material) {
        material.opacity = slot.opacity;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: cardCount }, (_, index) => {
        const card = CARDS[index % CARDS.length]!;
        const slot = getCylinderSlot(
          index,
          cardCount,
          controls.Cylinder.radius,
          0,
          depth,
        );

        return (
          <group key={index} position={slot.position} rotation={slot.rotation} scale={slot.scale}>
            <CarouselCard
              ref={(mesh) => {
                meshRefs.current[index] = mesh;
              }}
              card={card}
              width={controls.Cylinder.cardWidth}
              height={controls.Cylinder.cardHeight}
              opacity={slot.opacity}
            />
          </group>
        );
      })}
    </group>
  );
}

export function CameraRig({
  controls,
  pointer,
  reducedMotion,
}: {
  controls: CarouselControls;
  pointer: React.RefObject<PointerState>;
  reducedMotion: React.RefObject<boolean>;
}) {
  const smooth = useRef({ x: 0, y: 0, intensity: 0 });
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const rate = 1 - Math.pow(controls.Scroll.smoothness, delta);
    const ptr = pointer.current;
    const motionOff = reducedMotion.current;
    const targetIntensity = motionOff ? 0 : ptr.intensity;

    smooth.current.intensity = THREE.MathUtils.lerp(
      smooth.current.intensity,
      targetIntensity,
      rate,
    );
    smooth.current.x = THREE.MathUtils.lerp(
      smooth.current.x,
      motionOff ? 0 : ptr.x * smooth.current.intensity,
      rate,
    );
    smooth.current.y = THREE.MathUtils.lerp(
      smooth.current.y,
      motionOff ? 0 : ptr.y * smooth.current.intensity,
      rate,
    );

    const t = smooth.current.intensity;
    const baseZ = controls.Camera.distance;

    if (state.camera instanceof THREE.PerspectiveCamera) {
      state.camera.fov = controls.Camera.fov;
      state.camera.updateProjectionMatrix();
    }

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      smooth.current.x * controls.Camera.parallaxX * t,
      rate,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      -smooth.current.y * controls.Camera.parallaxY * t,
      rate,
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      baseZ + t * controls.Camera.hoverZoom,
      rate,
    );

    lookAt.current.set(
      -smooth.current.x * controls.Pointer.lookAtX * t,
      smooth.current.y * controls.Pointer.lookAtY * t,
      0,
    );
    state.camera.lookAt(lookAt.current);
  });

  return null;
}
