"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HeroLayoutProps } from "../versions";
import { DioramaCopy, ThemeSwitch, scenes, sourceSet, type SceneName } from "../DioramaHero";
import dioramaStyles from "../DioramaHero.module.css";
import { FocusLight } from "./FocusLight";
import { HousePings } from "./HousePings";
import { StreetLife } from "./StreetLife";
import { houses } from "./sceneMap";
import { useHouseCycle } from "./useHouseCycle";
import { useTilt } from "./useTilt";
import styles from "./LiveDiorama.module.css";

const HOUSE_IDS = houses.map((h) => h.id);
/** A tapped house keeps its card this long before the cycle resumes. */
const TAP_HOLD_MS = 4000;

/**
 * v7 "Haven at work": the v6 artwork, untouched, with life layered on top. Hovering (or tapping) a house puts
 * it in a spotlight and plays out what Haven is doing there: a text, a call or an email, Haven's reply, the
 * outcome. Left alone, Haven works through the houses by itself. Both scenes stay stacked and cross-fade on
 * the day/night switch, the stage tilts toward the mouse, and the street lamps flicker now and then.
 */
export default function LiveDiorama({ tone = "dark" }: HeroLayoutProps) {
  const [theme, setTheme] = useState<SceneName>(tone === "light" ? "day" : "night");
  const sectionRef = useRef<HTMLElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { rotateX, rotateY, handlers } = useTilt();
  const awake = useHeroAwake(sectionRef);

  const [pointed, setPointed] = useState<string | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  useEffect(() => {
    if (!tapped) return;
    const id = setTimeout(() => setTapped(null), TAP_HOLD_MS);
    return () => clearTimeout(id);
  }, [tapped]);

  const isOnScreen = useCallback((id: string) => {
    const beacon = artworkRef.current?.querySelector(`[data-house="${id}"]`);
    const frame = artworkRef.current?.getBoundingClientRect();
    if (!beacon || !frame) return false;
    const { left, top } = beacon.getBoundingClientRect();
    return left > frame.left + 40 && left < frame.right - 40 && top > frame.top + 40 && top < frame.bottom - 40;
  }, []);
  const cycled = useHouseCycle(HOUSE_IDS, awake && !reduce && !pointed && !tapped, isOnScreen);
  const active = pointed ?? tapped ?? cycled;

  // The spotlight keeps its last house while it fades out, rather than jumping away.
  const [lastFocus, setLastFocus] = useState<string | null>(null);
  useEffect(() => {
    if (active) setLastFocus(active);
  }, [active]);
  const focusHouse = houses.find((h) => h.id === (active ?? lastFocus));

  // The nav reads the hero's tone (solid on the light scene); keep it in step with the switch.
  useEffect(() => {
    document.documentElement.dataset.heroTone = theme === "day" ? "light" : "dark";
  }, [theme]);

  return (
    <section
      ref={sectionRef}
      className={dioramaStyles.hero}
      data-theme={theme}
      aria-labelledby="diorama-heading"
      {...handlers}
    >
      <div ref={artworkRef} className={styles.artwork}>
        <motion.div className={styles.stage} style={{ rotateX, rotateY, transformPerspective: 1800 }}>
          {(["day", "night"] as const).map((name) => (
            <SceneImage key={name} name={name} shown={theme === name} />
          ))}
          <FocusLight theme={theme} house={focusHouse} on={Boolean(active)} />
          <StreetLife theme={theme} activeHouse={active} />
          <HousePings theme={theme} active={active} onPoint={setPointed} onTap={setTapped} />
        </motion.div>
      </div>
      <DioramaCopy key={theme} theme={theme} className={styles.content} />
      <ThemeSwitch theme={theme} onChange={setTheme} />
    </section>
  );
}

/** Both scenes stay mounted so switching is a cross-fade, not a load; the hidden one downloads at low priority. */
function SceneImage({ name, shown }: { name: SceneName; shown: boolean }) {
  const scene = scenes[name];
  const fallback = scene.webp[2];
  return (
    <picture className={styles.scene} data-shown={shown} aria-hidden="true">
      <source type="image/avif" srcSet={sourceSet(scene.avif, scene.webp)} sizes="100vw" />
      <img
        src={fallback.src}
        srcSet={sourceSet(scene.webp)}
        sizes="100vw"
        width={fallback.width}
        height={fallback.height}
        alt=""
        fetchPriority={shown ? "high" : "low"}
        loading="eager"
      />
    </picture>
  );
}

/** True while the hero is on screen and the tab is visible, so the animation stops when nobody can see it. */
function useHeroAwake(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);

  return inView && tabVisible;
}

