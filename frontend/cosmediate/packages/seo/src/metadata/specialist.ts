import type { Specialist } from "@cosmediate/type-utils";
import type { Metadata } from "next";

import { getSeoMessagesForContext } from "@cosmediate/i18n";

import { fetchSpecialistServer } from "../fetch/server";
import { buildPublicPageMetadata } from "./build-page";
import type { SiteContext } from "../resolve-site";
import { formatRating, truncate } from "../utils";

function buildSpecialistDescription(
  ctx: SiteContext,
  specialist: Specialist,
): string {
  const m = getSeoMessagesForContext(ctx);
  const parts: string[] = [
    m.specialist.bookConsultation(specialist.fullName, specialist.city),
  ];

  if (specialist.reviewCount != null) {
    const rating = formatRating(specialist.avgRating);
    parts.push(
      rating
        ? `${m.entity.reviewsWithRating(specialist.reviewCount, rating)}.`
        : `${m.entity.reviewsCount(specialist.reviewCount)}.`,
    );
  }

  if (specialist.overview) {
    parts.push(truncate(specialist.overview, 100));
  } else {
    parts.push(m.entity.viewSpecialistDetails);
  }

  return truncate(parts.join(" "));
}

export function buildSpecialistMetadata(
  ctx: SiteContext,
  specialist: Specialist,
): Metadata {
  const title = specialist.city
    ? `${specialist.fullName} | ${specialist.city}`
    : specialist.fullName;

  return buildPublicPageMetadata(ctx, {
    title,
    description: buildSpecialistDescription(ctx, specialist),
    path: `/specialists/${specialist.id}`,
    image: specialist.image,
  });
}

export async function buildSpecialistMetadataById(
  ctx: SiteContext,
  id: string,
): Promise<Metadata> {
  const specialist = await fetchSpecialistServer(id);
  if (!specialist) {
    return { title: getSeoMessagesForContext(ctx).notFound.specialist };
  }

  return buildSpecialistMetadata(ctx, specialist);
}
