"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ActivityCard } from "./ActivityCard";
import { houseActivity } from "./houseActivity";
import type { SceneName } from "../DioramaHero";
import { ART, houses, toPercent, type CardPlacement, type House } from "./sceneMap";
import styles from "./LiveDiorama.module.css";

const ease = [0.16, 1, 0.3, 1] as const;

/** Where the card sits relative to its point, and the direction it slides in from. */
const placements: Record<CardPlacement, { transform: string; from: { x: number; y: number } }> = {
  left: { transform: "translate(calc(-100% - 22px), -24px)", from: { x: 8, y: 0 } },
  "left-up": { transform: "translate(calc(-100% - 22px), calc(-100% + 24px))", from: { x: 8, y: 0 } },
  right: { transform: "translate(22px, -24px)", from: { x: -8, y: 0 } },
};

interface HousePingsProps {
  theme: SceneName;
  active: string | null;
  /** Hovering (mouse) or tapping a house shows its card; `null` hands back to the auto cycle. */
  onPoint: (id: string | null) => void;
  onTap: (id: string) => void;
}

/**
 * "Haven at work": a soft beacon on each house, and, for the house in focus, a card that plays out what
 * Haven is doing there. The cards are decoration over the artwork, so they are hidden from screen readers.
 */
export function HousePings({ theme, active, onPoint, onTap }: HousePingsProps) {
  const house = houses.find((h) => h.id === active);

  return (
    <div className={styles.pings} aria-hidden="true">
      {houses.map((h) => (
        <div
          key={h.id}
          className={styles.hit}
          style={{ ...toPercent(h.center), width: `${((h.radius * 2) / ART.width) * 100}%` }}
          onPointerEnter={(e) => e.pointerType === "mouse" && onPoint(h.id)}
          onPointerLeave={(e) => e.pointerType === "mouse" && onPoint(null)}
          onClick={() => onTap(h.id)}
        />
      ))}

      {houses.map((h) => (
        <span key={h.id} data-house={h.id} className={styles.beacon} data-active={active === h.id} style={toPercent(h.anchor)} />
      ))}

      <AnimatePresence>{house && <HouseCardView key={`${theme}-${house.id}`} house={house} theme={theme} />}</AnimatePresence>
    </div>
  );
}

function HouseCardView({ house, theme }: { house: House; theme: SceneName }) {
  const activity = houseActivity[theme][house.id];
  const { transform, from } = placements[house.placement];
  if (!activity) return null;

  return (
    <div className={styles.cardAnchor} style={toPercent(house.cardAt ?? house.anchor)}>
      <div className={styles.cardPlace} style={{ "--card-transform": transform } as CSSProperties}>
        <motion.div
          initial={{ opacity: 0, ...from, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
          transition={{ duration: 0.45, ease }}
        >
          <ActivityCard activity={activity} />
        </motion.div>
      </div>
    </div>
  );
}
