"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persistent resend cooldown with attempt counting.
 *
 * Stores two values in localStorage:
 * - `<storageKey>:last_sent_at` — epoch ms of the most recent send
 * - `<storageKey>:count` — number of sends since the tracking window started
 *
 * Cooldown and attempt counter survive page refreshes. Attempt counter
 * auto-resets after `countResetMs` of inactivity (so a user coming back the
 * next day doesn't get a "too many attempts" message).
 */
export interface UseResendCooldownOptions {
  /** Prefix for the localStorage keys. Unique per flow (signup vs forgot). */
  storageKey: string;
  /** Cooldown duration in seconds. Default 60. */
  cooldownSeconds?: number;
  /** Attempts threshold at which we show the "too many attempts" message. Default 3. */
  strongMessageThreshold?: number;
  /** ms of inactivity after which the attempt counter resets. Default 1h. */
  countResetMs?: number;
}

export interface UseResendCooldownReturn {
  /** Seconds remaining on the cooldown (0 when ready). */
  secondsLeft: number;
  /** true while the cooldown is active. */
  isOnCooldown: boolean;
  /** Number of resend attempts within the current tracking window. */
  attemptCount: number;
  /** true once the user has gone over the strong-message threshold. */
  shouldShowStrongMessage: boolean;
  /**
   * Lock resend after the initial code send (or page landing). Does not bump attempt count.
   * Call on mount of the verify/reset form, and when the first code is sent on the prior step.
   */
  beginCooldown: () => void;
  /** Call after a successful resend to start the cooldown + bump the counter. */
  startCooldown: () => void;
  /** Clear all cooldown state (e.g. on successful verification). */
  reset: () => void;
}

/** Record initial send timestamp without incrementing the resend attempt counter. */
export function beginResendCooldown(storageKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${storageKey}:last_sent_at`, String(Date.now()));
}

export function useResendCooldown({
  storageKey,
  cooldownSeconds = 60,
  strongMessageThreshold = 3,
  countResetMs = 60 * 60 * 1000, // 1 hour
}: UseResendCooldownOptions): UseResendCooldownReturn {
  const lastSentKey = `${storageKey}:last_sent_at`;
  const countKey = `${storageKey}:count`;

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const computeSecondsLeft = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem(lastSentKey);
    if (!raw) return 0;
    const lastSentAt = Number(raw);
    if (!Number.isFinite(lastSentAt)) return 0;
    const elapsed = Math.floor((Date.now() - lastSentAt) / 1000);
    const remaining = cooldownSeconds - elapsed;
    return remaining > 0 ? remaining : 0;
  }, [lastSentKey, cooldownSeconds]);

  const readAttemptCount = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem(lastSentKey);
    if (!raw) return 0;
    const lastSentAt = Number(raw);
    if (!Number.isFinite(lastSentAt)) return 0;

    // If the last send was long enough ago, reset the window.
    if (Date.now() - lastSentAt > countResetMs) {
      localStorage.removeItem(countKey);
      return 0;
    }

    const rawCount = localStorage.getItem(countKey);
    const count = Number(rawCount);
    return Number.isFinite(count) && count > 0 ? count : 0;
  }, [lastSentKey, countKey, countResetMs]);

  // Hydrate from storage on mount + whenever the page gets focus.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => {
      setSecondsLeft(computeSecondsLeft());
      setAttemptCount(readAttemptCount());
    };

    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, [computeSecondsLeft, readAttemptCount]);

  // Tick every second while on cooldown.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        return next > 0 ? next : 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const beginCooldown = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(lastSentKey)) {
      localStorage.setItem(lastSentKey, String(Date.now()));
    }
    setSecondsLeft(computeSecondsLeft());
  }, [lastSentKey, computeSecondsLeft]);

  const startCooldown = useCallback(() => {
    if (typeof window === "undefined") return;
    const now = Date.now();
    localStorage.setItem(lastSentKey, String(now));
    const nextCount = readAttemptCount() + 1;
    localStorage.setItem(countKey, String(nextCount));
    setAttemptCount(nextCount);
    setSecondsLeft(cooldownSeconds);
  }, [lastSentKey, countKey, cooldownSeconds, readAttemptCount]);

  const reset = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(lastSentKey);
    localStorage.removeItem(countKey);
    setSecondsLeft(0);
    setAttemptCount(0);
  }, [lastSentKey, countKey]);

  return {
    secondsLeft,
    isOnCooldown: secondsLeft > 0,
    attemptCount,
    shouldShowStrongMessage: attemptCount >= strongMessageThreshold,
    beginCooldown,
    startCooldown,
    reset,
  };
}
