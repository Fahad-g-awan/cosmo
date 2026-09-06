import type { Treatment } from "@cosmediate/type-utils";
import type { Metadata } from "next";

import { getSeoMessagesForContext } from "@cosmediate/i18n";

import { fetchTreatmentServer } from "../fetch/server";
import { buildPublicPageMetadata } from "./build-page";
import type { SiteContext } from "../resolve-site";
import { truncate } from "../utils";

function buildTreatmentDescription(
  ctx: SiteContext,
  treatment: Treatment,
): string {
  const m = getSeoMessagesForContext(ctx);
  const parts: string[] = [m.treatment.learnAbout(treatment.name)];

  if (treatment.categoryName) {
    parts.push(m.entity.categoryLabel(treatment.categoryName));
  }

  if (treatment.overview) {
    parts.push(truncate(treatment.overview, 120));
  } else {
    parts.push(m.entity.findTreatmentProviders);
  }

  return truncate(parts.join(" "));
}

export function buildTreatmentMetadata(
  ctx: SiteContext,
  treatment: Treatment,
): Metadata {
  const title = treatment.categoryName
    ? `${treatment.name} | ${treatment.categoryName}`
    : treatment.name;

  return buildPublicPageMetadata(ctx, {
    title,
    description: buildTreatmentDescription(ctx, treatment),
    path: `/treatments/${treatment.id}`,
    image: treatment.image,
  });
}

export async function buildTreatmentMetadataById(
  ctx: SiteContext,
  id: string,
): Promise<Metadata> {
  const treatment = await fetchTreatmentServer(id);
  if (!treatment) {
    return { title: getSeoMessagesForContext(ctx).notFound.treatment };
  }

  return buildTreatmentMetadata(ctx, treatment);
}
