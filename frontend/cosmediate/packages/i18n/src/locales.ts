import {
  COSMEDIATE_TLDS,
  type CosmediateTld,
} from "@cosmediate/config";

import type { MessageLocale } from "./types";

/** Default market for x-default hreflang on production hosts. */
export const DEFAULT_MARKET_TLD = "nl" satisfies CosmediateTld;

/** SEO copy / lang tags on localhost (dev only). */
export const LOCALHOST_LOCALE_TLD = "com" satisfies CosmediateTld;

export const HREFLANG_BY_TLD: Record<CosmediateTld, string> = {
  com: "en",
  nl: "nl-NL",
  be: "nl-BE",
  de: "de-DE",
  fr: "fr-FR",
  gr: "el-GR",
  it: "it-IT",
};

export const OG_LOCALE_BY_TLD: Record<CosmediateTld, string> = {
  com: "en_GB",
  nl: "nl_NL",
  be: "nl_BE",
  de: "de_DE",
  fr: "fr_FR",
  gr: "el_GR",
  it: "it_IT",
};

/** BCP 47 language tag for `<html lang>`. */
export const HTML_LANG_BY_TLD: Record<CosmediateTld, string> = {
  com: "en",
  nl: "nl",
  be: "nl",
  de: "de",
  fr: "fr",
  gr: "el",
  it: "it",
};

/** Maps market TLD to the message bundle (Belgium reuses Dutch copy). */
export const MESSAGE_LOCALE_BY_TLD: Record<CosmediateTld, MessageLocale> = {
  com: "en",
  nl: "nl",
  be: "nl",
  de: "de",
  fr: "fr",
  gr: "el",
  it: "it",
};

export const WEB_ORIGIN_BY_TLD = Object.fromEntries(
  COSMEDIATE_TLDS.map((tld) => [tld, `https://cosmediate.${tld}`]),
) as Record<CosmediateTld, string>;

export const BLOG_ORIGIN_BY_TLD = Object.fromEntries(
  COSMEDIATE_TLDS.map((tld) => [tld, `https://blog.cosmediate.${tld}`]),
) as Record<CosmediateTld, string>;

export function resolveMessageLocale(tld: CosmediateTld | null): MessageLocale {
  const effectiveTld = tld ?? DEFAULT_MARKET_TLD;
  return MESSAGE_LOCALE_BY_TLD[effectiveTld];
}

export function resolveHreflang(tld: CosmediateTld | null): string {
  const effectiveTld = tld ?? DEFAULT_MARKET_TLD;
  return HREFLANG_BY_TLD[effectiveTld];
}

export function resolveHtmlLang(tld: CosmediateTld | null): string {
  const effectiveTld = tld ?? DEFAULT_MARKET_TLD;
  return HTML_LANG_BY_TLD[effectiveTld];
}

export function resolveOgLocale(tld: CosmediateTld | null): string {
  const effectiveTld = tld ?? DEFAULT_MARKET_TLD;
  return OG_LOCALE_BY_TLD[effectiveTld];
}

export function isMessageLocale(value: string): value is MessageLocale {
  return (
    value === "en" ||
    value === "nl" ||
    value === "de" ||
    value === "fr" ||
    value === "it" ||
    value === "el"
  );
}
