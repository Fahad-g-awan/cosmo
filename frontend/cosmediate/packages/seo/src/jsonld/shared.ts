import type { SiteContext } from "../resolve-site";
import { buildCanonicalUrl, toAbsoluteUrl } from "../utils";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(
  ctx: SiteContext,
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(ctx.origin, item.path),
    })),
  };
}

export function buildAggregateRatingJsonLd(
  avgRating?: number,
  reviewCount?: number,
): Record<string, unknown> | undefined {
  if (avgRating == null || !reviewCount) {
    return undefined;
  }

  return {
    "@type": "AggregateRating",
    ratingValue: avgRating,
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

export function buildPostalAddress(fields: {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}): Record<string, unknown> | undefined {
  if (
    !fields.streetAddress &&
    !fields.addressLocality &&
    !fields.postalCode &&
    !fields.addressCountry
  ) {
    return undefined;
  }

  return {
    "@type": "PostalAddress",
    ...(fields.streetAddress ? { streetAddress: fields.streetAddress } : {}),
    ...(fields.addressLocality ? { addressLocality: fields.addressLocality } : {}),
    ...(fields.addressRegion ? { addressRegion: fields.addressRegion } : {}),
    ...(fields.postalCode ? { postalCode: fields.postalCode } : {}),
    ...(fields.addressCountry ? { addressCountry: fields.addressCountry } : {}),
  };
}

export function absoluteImage(
  ctx: SiteContext,
  image?: string | null,
): string | undefined {
  return toAbsoluteUrl(ctx.origin, image ?? "/logos/logo.svg");
}
