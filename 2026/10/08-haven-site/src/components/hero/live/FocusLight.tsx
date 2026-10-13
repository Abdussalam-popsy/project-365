import type { CSSProperties } from "react";
import { scenes, sourceSet, type SceneName } from "../DioramaHero";
import { ART, type House } from "./sceneMap";
import styles from "./LiveDiorama.module.css";

/**
 * Puts one house in the spotlight: the rest of the scene dims behind a soft veil, and a brightened copy of
 * the artwork shows through a circle over the house. Works on both scenes with the current art; a darker
 * base image would only make the lift stronger. `house` stays set while `on` fades it out, so the light doesn't
 * jump away as it goes; the position glides between houses (see @property in the CSS).
 */
export function FocusLight({ theme, house, on }: { theme: SceneName; house: House | undefined; on: boolean }) {
  const scene = scenes[theme];
  const fallback = scene.webp[2];

  const vars = house
    ? ({
        "--fx": `${(house.center[0] / ART.width) * 100}%`,
        "--fy": `${(house.center[1] / ART.height) * 100}%`,
        "--frx": `${(house.radius / ART.width) * 100}%`,
        "--fry": `${(house.radius / ART.height) * 100}%`,
      } as CSSProperties)
    : undefined;

  return (
    <div className={styles.focus} data-on={on && Boolean(house)} style={vars} aria-hidden="true">
      <div className={styles.veil} />
      <picture className={styles.lift}>
        <source type="image/avif" srcSet={sourceSet(scene.avif, scene.webp)} sizes="100vw" />
        <img src={fallback.src} srcSet={sourceSet(scene.webp)} sizes="100vw" alt="" />
      </picture>
    </div>
  );
}
