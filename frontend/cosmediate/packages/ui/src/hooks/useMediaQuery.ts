"use client";

import { useEffect, useState } from "react";

export type BreakPoint = "mobile" | "tablet" | "small-desktop" | "desktop";

const breakPoints: Record<BreakPoint, string> = {
  mobile: "(max-width: 768px)",
  tablet: "(max-width: 1024px)",
  "small-desktop": "(max-width: 1280px)",
  desktop: "(min-width: 1281px)",
};

export function useMediaQuery(query: BreakPoint) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(breakPoints[query]);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
