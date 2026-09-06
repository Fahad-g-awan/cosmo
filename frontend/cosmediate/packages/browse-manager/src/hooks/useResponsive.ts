"use client";

import { useState, useEffect } from "react";

export interface ResponsiveState {
  isMobileView: boolean;
  isTabletView: boolean;
  isDesktopView: boolean;
  windowWidth: number;
}

/**
 * Hook to detect responsive breakpoints
 * - Mobile: < 640px
 * - Tablet: >= 640px && < 1024px
 * - Desktop: >= 1024px
 */
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobileView: false,
    isTabletView: false,
    isDesktopView: true,
    windowWidth: typeof window !== "undefined" ? window.innerWidth : 1024,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateState = () => {
      const width = window.innerWidth;
      setState({
        isMobileView: width < 640,
        isTabletView: width >= 640 && width < 1024,
        isDesktopView: width >= 1024,
        windowWidth: width,
      });
    };

    // Initial update
    updateState();

    window.addEventListener("resize", updateState);
    return () => window.removeEventListener("resize", updateState);
  }, []);

  return state;
};
