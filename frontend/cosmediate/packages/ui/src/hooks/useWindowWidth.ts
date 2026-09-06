"use client";

import { useState, useEffect } from "react";

export const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const [isXLScreen, setIsXLScreen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setWindowWidth(window.innerWidth);
    setIsMobileView(window.innerWidth < 640);
    setIsTabletView(window.innerWidth >= 640 && window.innerWidth < 1024);
    setIsXLScreen(window.innerWidth >= 1024 && window.innerWidth < 1280);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobileView(window.innerWidth < 640);
      setIsTabletView(window.innerWidth >= 640 && window.innerWidth < 1024);
      setIsXLScreen(window.innerWidth >= 1024 && window.innerWidth < 1280);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isMobileView,
    isTabletView,
    isXLScreen,
    windowWidth,
  };
};
