import type { Metadata } from "next";

import { getSeoMessagesForContext } from "@cosmediate/i18n";
import type { Clinic } from "@cosmediate/type-utils";

import { buildPublicPageMetadata } from "./build-page";
import { fetchClinicServer } from "../fetch/server";
import type { SiteContext } from "../resolve-site";
import { formatRating, truncate } from "../utils";

function buildClinicDescription(ctx: SiteContext, clinic: Clinic): string {
  const m = getSeoMessagesForContext(ctx);
  const parts: string[] = [];

  if (clinic.city) {
    parts.push(m.clinic.bookInCity(clinic.name, clinic.city));
  } else {
    parts.push(m.clinic.bookOnPlatform(clinic.name));
  }

  const stats: string[] = [];
  if (clinic.specialistCount != null) {
    stats.push(m.entity.specialistsCount(clinic.specialistCount));
  }
  if (clinic.treatmentCount != null) {
    stats.push(m.entity.treatmentsCount(clinic.treatmentCount));
  }
  if (clinic.reviewCount != null) {
    const rating = formatRating(clinic.avgRating);
    stats.push(
      rating
        ? m.entity.reviewsWithRating(clinic.reviewCount, rating)
        : m.entity.reviewsCount(clinic.reviewCount),
    );
  }

  if (stats.length > 0) {
    parts.push(`${stats.join(", ")}.`);
  }

  if (clinic.overview) {
    parts.push(truncate(clinic.overview, 100));
  } else {
    parts.push(m.entity.viewClinicDetails);
  }

  return truncate(parts.join(" "));
}

export function buildClinicMetadata(
  ctx: SiteContext,
  clinic: Clinic,
): Metadata {
  const title = clinic.city ? `${clinic.name} | ${clinic.city}` : clinic.name;
  const description = buildClinicDescription(ctx, clinic);
  const image = clinic.logo || clinic.images?.[0];

  return buildPublicPageMetadata(ctx, {
    title,
    description,
    path: `/clinics/${clinic.id}`,
    image,
  });
}

export async function buildClinicMetadataById(
  ctx: SiteContext,
  id: string,
): Promise<Metadata> {
  const clinic = await fetchClinicServer(id);
  if (!clinic) {
    return { title: getSeoMessagesForContext(ctx).notFound.clinic };
  }

  return buildClinicMetadata(ctx, clinic);
}
