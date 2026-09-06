"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import type { MessageLocale, UiMessages, UiNamespace } from "./types";

interface I18nContextValue {
  locale: MessageLocale;
  messages: UiMessages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  locale: MessageLocale;
  messages: UiMessages;
  children: ReactNode;
}

export function I18nProvider({
  locale,
  messages,
  children,
}: I18nProviderProps) {
  const value = useMemo(
    () => ({
      locale,
      messages,
    }),
    [locale, messages],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useLocale(): MessageLocale {
  return useI18n().locale;
}

export function useTranslations<N extends UiNamespace>(
  namespace: N,
): UiMessages[N] {
  return useI18n().messages[namespace];
}
