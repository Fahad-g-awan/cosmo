import type { Clinic } from "@cosmediate/type-utils";

import type { SiteContext } from "../resolve-site";
import { truncate } from "../utils";
import { buildFaqPageJsonLd } from "./faq";
import {
  absoluteImage,
  buildAggregateRatingJsonLd,
  buildBreadcrumbJsonLd,
  buildPostalAddress,
} from "./shared";

export function buildClinicPageJsonLd(
  ctx: SiteContext,
  clinic: Clinic,
): Record<string, unknown>[] {
  const path = `/clinics/${clinic.id}`;
  const image = absoluteImage(ctx, clinic.logo || clinic.images?.[0]);
  const address = buildPostalAddress({
    streetAddress: clinic.completeAddress,
    addressLocality: clinic.city,
    addressRegion: clinic.state,
    postalCode: clinic.postalCode,
    addressCountry: clinic.country,
  });
  const aggregateRating = buildAggregateRatingJsonLd(
    clinic.avgRating,
    clinic.reviewCount,
  );

  const schemas: Record<string, unknown>[] = [
    buildBreadcrumbJsonLd(ctx, [
      { name: "Home", path: "/" },
      { name: "Clinics", path: "/clinics" },
      { name: clinic.name, path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      name: clinic.name,
      url: new URL(path, ctx.origin).toString(),
      ...(clinic.overview
        ? { description: truncate(clinic.overview) }
        : {}),
      ...(image ? { image } : {}),
      ...(address ? { address } : {}),
      ...(clinic.phone ? { telephone: clinic.phone } : {}),
      ...(clinic.email ? { email: clinic.email } : {}),
      ...(clinic.website ? { sameAs: [clinic.website] } : {}),
      ...(aggregateRating ? { aggregateRating } : {}),
    },
  ];

  const faqSchema = buildFaqPageJsonLd(clinic.faqs);
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  return schemas;
}
