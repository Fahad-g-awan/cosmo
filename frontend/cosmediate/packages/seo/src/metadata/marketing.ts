import type { Metadata } from "next";

import { getSeoMessagesForContext } from "@cosmediate/i18n";

import { buildMarketingPageJsonLd } from "../jsonld/blog";
import { buildPublicPageMetadata } from "./build-page";
import { buildHomePageJsonLd } from "../jsonld/home";
import type { SiteContext } from "../resolve-site";

export const WEB_MARKETING_PAGE_PATHS = {
  home: "/",
  about: "/about",
  contact: "/contact",
  vacancies: "/vacancies",
  partnersClinics: "/partners/clinics",
  registerClinic: "/partners/register/clinic",
  registerDoctor: "/partners/register/doctor",
  privacyPolicy: "/privacy-policy",
  termsAndConditions: "/terms-and-conditions",
} as const;

export type WebMarketingPageKey = keyof typeof WEB_MARKETING_PAGE_PATHS;

export function buildMarketingMetadata(
  ctx: SiteContext,
  key: WebMarketingPageKey,
): Metadata {
  const page = getSeoMessagesForContext(ctx).marketing[key];
  return buildPublicPageMetadata(ctx, {
    title: page.title,
    description: page.description,
    path: WEB_MARKETING_PAGE_PATHS[key],
  });
}

export function buildMarketingPageJsonLdForKey(
  ctx: SiteContext,
  key: WebMarketingPageKey,
): Record<string, unknown>[] {
  if (key === "home") {
    return buildHomePageJsonLd(ctx);
  }

  const page = getSeoMessagesForContext(ctx).marketing[key];
  return buildMarketingPageJsonLd(
    ctx,
    page.title,
    WEB_MARKETING_PAGE_PATHS[key],
  );
}
