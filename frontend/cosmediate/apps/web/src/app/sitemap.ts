import {
  WEB_SITEMAP_SEGMENTS,
  buildEntitySitemapEntries,
  buildStaticWebSitemapEntries,
  fetchClinicListForSitemap,
  fetchSpecialistListForSitemap,
  fetchTreatmentListForSitemap,
  resolveSiteContext,
  type SitemapSegmentId,
} from "@cosmediate/seo";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export async function generateSitemaps() {
  return WEB_SITEMAP_SEGMENTS.map((id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<SitemapSegmentId>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const ctx = await resolveSiteContext("web");

  if (!ctx.indexable) {
    return [];
  }

  switch (id) {
    case "pages":
      return buildStaticWebSitemapEntries(ctx.origin);
    case "clinics": {
      const items = await fetchClinicListForSitemap();
      return buildEntitySitemapEntries(ctx.origin, "/clinics", items);
    }
    case "specialists": {
      const items = await fetchSpecialistListForSitemap();
      return buildEntitySitemapEntries(ctx.origin, "/specialists", items);
    }
    case "treatments": {
      const items = await fetchTreatmentListForSitemap();
      return buildEntitySitemapEntries(ctx.origin, "/treatments", items);
    }
    default:
      return [];
  }
}
