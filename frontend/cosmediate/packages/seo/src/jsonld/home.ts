import { getSeoMessagesForContext } from "@cosmediate/i18n";

import type { SiteContext } from "../resolve-site";
import { absoluteImage } from "./shared";

export function buildHomePageJsonLd(
  ctx: SiteContext,
): Record<string, unknown>[] {
  const messages = getSeoMessagesForContext(ctx);
  const logo = absoluteImage(ctx, "/logos/logo.svg");
  const homeNavItems = [
    { name: messages.nav.treatments, path: "/home/treatments" },
    { name: messages.nav.clinics, path: "/home/clinics" },
    { name: messages.nav.specialists, path: "/home/specialists" },
    { name: messages.nav.blog, path: "/blog" },
    { name: messages.nav.about, path: "/home/about" },
    { name: messages.nav.contact, path: "/home/contact" },
  ] as const;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: messages.siteName,
      url: ctx.origin,
      logo,
      description: messages.web.defaultDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      name: messages.siteName,
      url: ctx.origin,
      image: logo,
      description: messages.web.defaultDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: messages.siteName,
      url: ctx.origin,
    },
    ...homeNavItems.map((item) => ({
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      name: item.name,
      url: `${ctx.origin}${item.path}`,
    })),
  ];
}
