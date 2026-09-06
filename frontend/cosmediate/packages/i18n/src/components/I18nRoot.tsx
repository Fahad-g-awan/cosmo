"use client";

import { useEffect, useMemo } from "react";

import { setLocaleCookieClient } from "@cosmediate/config";

import type { MessageLocale } from "../types";
import { getUiMessages } from "../messages";
import { I18nProvider } from "../client";

export interface I18nRootProps {
  locale: MessageLocale;
  children: React.ReactNode;
}

function LocaleCookieSync({ locale }: { locale: MessageLocale }) {
  useEffect(() => {
    setLocaleCookieClient(locale);
  }, [locale]);

  return null;
}

/**
 * Client root that provides i18n context and syncs locale cookie for auth handoff.
 * Messages are resolved on the client so catalogs may include functions (e.g. resendIn).
 */
export function I18nRoot({ locale, children }: I18nRootProps) {
  const messages = useMemo(() => getUiMessages(locale), [locale]);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <LocaleCookieSync locale={locale} />
      {children}
    </I18nProvider>
  );
}
