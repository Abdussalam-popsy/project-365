import { useCallback, useEffect, useRef, useState } from "react";
import { CardScene } from "./CardScene";

const AUDIO_URL = "/audio/locked-in.mp3";

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
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

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audioReady) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      // Click should satisfy autoplay policy
    }
  }, [audioReady, playing]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-neutral-950 text-neutral-50">
      <CardScene playing={playing} onToggle={togglePlay} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 pb-10">
        <p className="text-center text-sm text-neutral-400">
          Drag to rotate · Click the card to {playing ? "pause" : "play"}
        </p>
        {playing && audioReady && (
          <p className="mt-2 text-center text-xs text-emerald-400/90">
            Locked In · playing
          </p>
        )}
      </div>
    </div>
  );
}
