import type { StaticImageData } from "next/image";
import type { HeroLayoutProps } from "./versions";
import { hero } from "@/content/site";
import { Button } from "../Button";
import { PhoneIcon } from "../PhoneIcon";
import { RotatingWords } from "./RotatingWords";
import daySmallAvif from "../../../public/hero/haven-day-768.avif";
import dayMediumAvif from "../../../public/hero/haven-day-1200.avif";
import dayLargeAvif from "../../../public/hero/haven-day-1586.avif";
import daySmallWebp from "../../../public/hero/haven-day-768.webp";
import dayMediumWebp from "../../../public/hero/haven-day-1200.webp";
import dayLargeWebp from "../../../public/hero/haven-day-1586.webp";
import nightSmallAvif from "../../../public/hero/haven-night-768.avif";
import nightMediumAvif from "../../../public/hero/haven-night-1200.avif";
import nightLargeAvif from "../../../public/hero/haven-night-1586.avif";
import nightSmallWebp from "../../../public/hero/haven-night-768.webp";
import nightMediumWebp from "../../../public/hero/haven-night-1200.webp";
import nightLargeWebp from "../../../public/hero/haven-night-1586.webp";
import styles from "./DioramaHero.module.css";

export type SceneName = "night" | "day";

export const scenes = {
  night: {
    prefix: "Haven answers your",
    /** Rotates every 2.6s; the first one is what screen readers and reduced-motion visitors get. */
    headlines: ["2am emergencies.", "maintenance calls.", "leasing leads.", "after-hours texts."],
    description:
      "Late-night calls and urgent repairs, handled while your team is off the clock.",
    avif: [nightSmallAvif, nightMediumAvif, nightLargeAvif],
    webp: [nightSmallWebp, nightMediumWebp, nightLargeWebp],
  },
  day: {
    prefix: "Haven keeps your",
    headlines: ["work orders moving.", "tours booked.", "vendors on schedule.", "residents in the loop."],
    description:
      "From the first request to the final follow-up, keep maintenance moving without chasing every detail.",
    avif: [daySmallAvif, dayMediumAvif, dayLargeAvif],
    webp: [daySmallWebp, dayMediumWebp, dayLargeWebp],
  },
};

export function sourceSet(images: StaticImageData[], dimensions = images) {
  return images
    .map(({ src }, index) => `${src} ${dimensions[index].width}w`)
    .join(", ");
}

export default function DioramaHero({
  tone = "dark",
  onSelect,
}: HeroLayoutProps) {
  const theme = tone === "light" ? "day" : "night";
  const scene = scenes[theme];
  const fallback = scene.webp[2];

  return (
    <section
      className={styles.hero}
      data-theme={theme}
      aria-labelledby="diorama-heading"
    >
      <picture className={styles.artwork} aria-hidden="true">
        <source
          type="image/avif"
          srcSet={sourceSet(scene.avif, scene.webp)}
          sizes="100vw"
        />
        <img
          src={fallback.src}
          srcSet={sourceSet(scene.webp)}
          sizes="100vw"
          width={fallback.width}
          height={fallback.height}
          alt=""
          fetchPriority="high"
          loading="eager"
        />
      </picture>
      <DioramaCopy theme={theme} />
      {onSelect && (
        <ThemeSwitch theme={theme} onChange={(next) => onSelect(next === "day" ? "v6-light" : "v6")} />
      )}
    </section>
  );
}

/** The hero copy for a scene: lead, rotating headline, description, buttons and the YC line. */
export function DioramaCopy({ theme, className = "" }: { theme: SceneName; className?: string }) {
  const scene = scenes[theme];
  return (
    <div className={`${styles.content} ${className}`}>
      <p className={styles.lead} data-hero-copy>
        {hero.lead}
      </p>
      <h1
        id="diorama-heading"
        className={styles.heading}
        data-hero-copy
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Visually, the prefix plus rotating words; for screen readers, one stable sentence. */}
        <span className="sr-only">
          {scene.prefix} {scene.headlines[0]}
        </span>
        <span aria-hidden className={styles.prefix}>
          {scene.prefix}
        </span>
        <RotatingWords words={scene.headlines} />
      </h1>
      <p className={styles.description} data-hero-copy>
        {scene.description}
      </p>
      <div className={styles.actions}>
        <Button variant={theme === "night" ? "light" : "solid"}>
          Book a demo
          <svg
            className="ml-4"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M4 12h16m-6-6 6 6-6 6" />
          </svg>
        </Button>
        <Button variant="outline" href="#voice-demo">
          <PhoneIcon className="mr-2" />
          Hear a call
        </Button>
      </div>
      <p className={styles.backing} data-hero-copy>
        <span className={styles.yc} aria-hidden="true">
          Y
        </span>
        Backed by Y Combinator
      </p>
    </div>
  );
}

/** The day/night toggle in the hero's corner. */
export function ThemeSwitch({ theme, onChange }: { theme: SceneName; onChange: (theme: SceneName) => void }) {
  return (
    <div
      className={styles.themeSwitch}
      role="group"
      aria-label="Hero appearance"
    >
      {(
        [
          { label: "Day", theme: "day" },
          { label: "Night", theme: "night" },
        ] as const
      ).map((option) => (
        <button
          key={option.theme}
          type="button"
          aria-label={option.label}
          title={`${option.label} scene`}
          aria-pressed={theme === option.theme}
          onClick={() => onChange(option.theme)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {option.theme === "day" ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </>
            ) : (
              <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
            )}
          </svg>
        </button>
      ))}
    </div>
  );
}
