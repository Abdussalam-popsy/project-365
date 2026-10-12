import type { StaticImageData } from "next/image";
import type { HeroLayoutProps } from "./versions";
import { hero } from "@/content/site";
import { Button } from "../Button";
import { PhoneIcon } from "../PhoneIcon";
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

const artwork = {
  night: {
    avif: [nightSmallAvif, nightMediumAvif, nightLargeAvif],
    webp: [nightSmallWebp, nightMediumWebp, nightLargeWebp],
  },
  day: {
    avif: [daySmallAvif, dayMediumAvif, dayLargeAvif],
    webp: [daySmallWebp, dayMediumWebp, dayLargeWebp],
  },
};

function sourceSet(images: StaticImageData[], dimensions = images) {
  return images
    .map(({ src }, index) => `${src} ${dimensions[index].width}w`)
    .join(", ");
}

export default function DioramaHero({
  tone = "dark",
  onSelect,
}: HeroLayoutProps) {
  const theme = tone === "light" ? "day" : "night";
  const images = artwork[theme];
  const fallback = images.webp[2];

  return (
    <section
      className={styles.hero}
      data-theme={theme}
      aria-labelledby="diorama-heading"
    >
      <picture className={styles.artwork} aria-hidden="true">
        <source
          type="image/avif"
          srcSet={sourceSet(images.avif, images.webp)}
          sizes="100vw"
        />
        <img
          src={fallback.src}
          srcSet={sourceSet(images.webp)}
          sizes="100vw"
          width={fallback.width}
          height={fallback.height}
          alt=""
          fetchPriority="high"
          loading="eager"
        />
      </picture>
      <div className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.lead} data-hero-copy>
            {hero.lead}
          </p>
          {onSelect && (
            <div
              className={styles.themeSwitch}
              role="group"
              aria-label="Hero appearance"
            >
              {(
                [
                  { id: "v6-light", label: "Day", theme: "day" },
                  { id: "v6", label: "Night", theme: "night" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={theme === option.theme}
                  onClick={() => onSelect(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <h1 id="diorama-heading" className={styles.heading} data-hero-copy>
          {hero.prefix}
          <span>{hero.rotating[3]}</span>
        </h1>
        <p className={styles.description} data-hero-copy>
          {hero.sub}
        </p>
        <div className={styles.actions}>
          <Button>
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
    </section>
  );
}
