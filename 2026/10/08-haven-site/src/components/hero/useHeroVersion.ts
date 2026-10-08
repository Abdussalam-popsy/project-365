"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultHeroVersion, heroVersions } from "./versions";

const PARAM = "hero";

/** Reads `?hero=v2` after mount (static export has no server query), and exposes a setter that keeps the URL shareable. */
export function useHeroVersion() {
  const [id, setId] = useState(defaultHeroVersion);
  const [comparing, setComparing] = useState(process.env.NODE_ENV === "development");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(PARAM);
    if (requested && heroVersions.some((v) => v.id === requested)) setId(requested);
    if (requested) setComparing(true);
  }, []);

  const select = useCallback((next: string) => {
    setId(next);
    setComparing(true);
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, next);
    window.history.replaceState(null, "", url);
  }, []);

  const version = heroVersions.find((v) => v.id === id) ?? heroVersions[0];
  return { version, select, comparing };
}
