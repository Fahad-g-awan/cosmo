import type { Specialist } from "@cosmediate/type-utils";

import type { SiteContext } from "../resolve-site";
import { buildFaqPageJsonLd } from "./faq";
import { truncate } from "../utils";
import {
  absoluteImage,
  buildAggregateRatingJsonLd,
  buildBreadcrumbJsonLd,
  buildPostalAddress,
} from "./shared";

export function buildSpecialistPageJsonLd(
  ctx: SiteContext,
  specialist: Specialist,
): Record<string, unknown>[] {
  const path = `/specialists/${specialist.id}`;
  const image = absoluteImage(ctx, specialist.image);
  const address = buildPostalAddress({
    streetAddress: specialist.completeAddress,
    addressLocality: specialist.city,
    addressRegion: specialist.state,
    postalCode: specialist.postalCode,
    addressCountry: specialist.country,
  });
  const aggregateRating = buildAggregateRatingJsonLd(
    specialist.avgRating,
    specialist.reviewCount,
  );

  const schemas: Record<string, unknown>[] = [
    buildBreadcrumbJsonLd(ctx, [
      { name: "Home", path: "/" },
      { name: "Specialists", path: "/specialists" },
      { name: specialist.fullName, path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Physician",
      name: specialist.fullName,
      url: new URL(path, ctx.origin).toString(),
      ...(specialist.overview
        ? { description: truncate(specialist.overview) }
        : {}),
      ...(image ? { image } : {}),
      ...(address ? { address } : {}),
      ...(specialist.phone ? { telephone: specialist.phone } : {}),
      ...(specialist.email ? { email: specialist.email } : {}),
      ...(aggregateRating ? { aggregateRating } : {}),
    },
  ];

  const faqSchema = buildFaqPageJsonLd(specialist.faqs);
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  return schemas;
}
