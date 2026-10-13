import type { SceneName } from "../DioramaHero";
import { ART, houses, lamps } from "./sceneMap";
import styles from "./LiveDiorama.module.css";

/**
 * Light drawn over the artwork, blended with `screen` so it only ever brightens what is there: lamp glows
 * that flicker now and then, and window glows that come up on the house Haven is working at.
 */
export function StreetLife({ theme, activeHouse }: { theme: SceneName; activeHouse: string | null }) {
  return (
    <svg className={styles.street} data-theme={theme} viewBox={`0 0 ${ART.width} ${ART.height}`} aria-hidden="true">
      <defs>
        <radialGradient id="live-lamp">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb760" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="live-window">
          <stop offset="0" stopColor="#ffe2a8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb760" stopOpacity="0" />
        </radialGradient>
      </defs>

      {lamps.map(([x, y], i) => (
        <circle key={`lamp-${x}`} className={styles.lamp} cx={x} cy={y} r={44} fill="url(#live-lamp)" style={{ animationDelay: `${i * -2.3}s` }} />
      ))}

      {houses.map((house) =>
        house.windows.map(([x, y]) => (
          <circle
            key={`${house.id}-${x}-${y}`}
            className={styles.window}
            data-lit={activeHouse === house.id}
            cx={x}
            cy={y}
            r={26}
            fill="url(#live-window)"
          />
        )),
      )}
    </svg>
  );
}

