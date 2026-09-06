"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_COOLDOWN_MS = 5000;

export const useRefreshCooldown = (cooldownMs = DEFAULT_COOLDOWN_MS) => {
  const totalSeconds = Math.ceil(cooldownMs / 1000);

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isCooldown, setIsCooldown] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(() => {
    clearTimers();
    setIsCooldown(true);
    setSecondsLeft(totalSeconds);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      clearTimers();
      setIsCooldown(false);
      setSecondsLeft(0);
    }, cooldownMs);
  }, [clearTimers, cooldownMs, totalSeconds]);

  useEffect(() => {
    startCooldown();

    return () => {
      clearTimers();
    };
  }, [startCooldown, clearTimers]);

  return { isCooldown, secondsLeft, startCooldown };
};
