import { COSMEDIATE_TLDS } from "@cosmediate/config";
import {
  BLOG_ORIGIN_BY_TLD,
  DEFAULT_MARKET_TLD,
  HREFLANG_BY_TLD,
  WEB_ORIGIN_BY_TLD,
} from "@cosmediate/i18n/locales";
import type { SiteContext, SeoAppKind } from "./resolve-site";

export function shouldEmitHreflang(ctx: SiteContext): boolean {
  return ctx.indexable && (ctx.app === "web" || ctx.app === "blog");
}

export function buildHreflangAlternates(
  app: Extract<SeoAppKind, "web" | "blog">,
  path: string,
): Record<string, string> {
  const origins = app === "web" ? WEB_ORIGIN_BY_TLD : BLOG_ORIGIN_BY_TLD;
  const alternates: Record<string, string> = {};

  for (const tld of COSMEDIATE_TLDS) {
    const hreflang = HREFLANG_BY_TLD[tld];
    alternates[hreflang] = new URL(path, origins[tld]).toString();
  }

  alternates["x-default"] = new URL(
    path,
    origins[DEFAULT_MARKET_TLD],
  ).toString();

  return alternates;
}
