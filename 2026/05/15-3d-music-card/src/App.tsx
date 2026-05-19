import { useEffect, useRef, useState } from "react";
import { CardScene } from "./CardScene";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";

const AUDIO_URL = `${import.meta.env.BASE_URL}audio/locked-in.mp3`;

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [active, setActive] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_URL);
    audio.loop = true;
    audio.preload = "auto";

    const markReady = () => setAudioReady(true);
    const markError = () => setAudioReady(false);

    audio.addEventListener("canplaythrough", markReady);
    audio.addEventListener("loadeddata", markReady);
    audio.addEventListener("error", markError);
    audioRef.current = audio;
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) markReady();

    return () => {
      audio.pause();
      audio.removeEventListener("canplaythrough", markReady);
      audio.removeEventListener("loadeddata", markReady);
      audio.removeEventListener("error", markError);
      audioRef.current = null;
    };
  }, []);

  // Hold to play: pointerdown starts, pointerup anywhere stops
  const handleStart = async () => {
    const audio = audioRef.current;
    if (!audio || !audioReady) return;
    setActive(true);
    try {
      await audio.play();
    } catch {
      // autoplay policy — user gesture satisfies it
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setActive(false);
  };

  useEffect(() => {
    window.addEventListener("pointerup", handleStop);
    return () => window.removeEventListener("pointerup", handleStop);
  });

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-neutral-950 text-neutral-50"
      onPointerDown={handleStart}
    >
      <DialRoot position="top-right" defaultOpen={false} theme="dark" />
      <CardScene active={active} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 pb-10">
        <p className="text-center text-sm text-neutral-400">
          Hold to play · Drag to spin
        </p>
        {active && audioReady && (
          <p className="mt-2 text-center text-xs text-emerald-400/90">
            Locked In · playing
          </p>
        )}
      </div>
    </div>
  );
}
