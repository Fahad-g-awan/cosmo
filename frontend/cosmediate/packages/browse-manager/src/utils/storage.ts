"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_PREFIX = "browse_manager_";

/**
 * Get a value from localStorage
 */
export const getStorageValue = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Set a value in localStorage
 */
export const setStorageValue = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(value)
    );
  } catch {
    // Ignore storage errors
  }
};

/**
 * Remove a value from localStorage
 */
export const removeStorageValue = (key: string): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Ignore storage errors
  }
};

/**
 * Hook for persisting preferences to localStorage
 */
export const useLocalPreferences = (pageType: string) => {
  const storageKey = `prefs_${pageType}`;

  const [preferences, setPreferencesState] = useState<Record<string, unknown>>(
    {}
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const stored = getStorageValue<Record<string, unknown>>(storageKey, {});
    setPreferencesState(stored);
    setIsLoaded(true);
  }, [storageKey]);

  // Set a single preference
  const setPreference = useCallback(
    (key: string, value: unknown) => {
      setPreferencesState((prev) => {
        const updated = { ...prev, [key]: value };
        setStorageValue(storageKey, updated);
        return updated;
      });
    },
    [storageKey]
  );

  // Clear all preferences
  const clearPreferences = useCallback(() => {
    setPreferencesState({});
    removeStorageValue(storageKey);
  }, [storageKey]);

  return {
    preferences,
    isLoaded,
    setPreference,
    clearPreferences,
  };
};

export type UseLocalPreferencesReturn = ReturnType<typeof useLocalPreferences>;
