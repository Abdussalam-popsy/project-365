import { forwardRef, useMemo } from "react";
import type { Mesh } from "three";
import type { CardData } from "../data/cards";
import { drawCardTexture } from "../utils/drawCardTexture";

type CarouselCardProps = {
  card: CardData;
  width: number;
  height: number;
  opacity: number;
};

export const CarouselCard = forwardRef<Mesh, CarouselCardProps>(
  function CarouselCard({ card, width, height, opacity }, ref) {
    const texture = useMemo(() => drawCardTexture(card), [card]);

    return (
      <mesh ref={ref} scale={[width, height, 1]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={opacity}
          toneMapped={false}
          depthWrite={false}
          depthTest
        />
      </mesh>
    );
  },
);
