import {
  BLOG_SITEMAP_SEGMENTS,
  buildBlogHomeSitemapEntry,
  buildEntitySitemapEntries,
  fetchBlogListForSitemap,
  resolveSiteContext,
  type SitemapSegmentId,
} from "@cosmediate/seo";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export async function generateSitemaps() {
  return BLOG_SITEMAP_SEGMENTS.map((id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<SitemapSegmentId>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const ctx = await resolveSiteContext("blog");

  if (!ctx.indexable) {
    return [];
  }

  switch (id) {
    case "pages":
      return buildBlogHomeSitemapEntry(ctx.origin);
    case "blogs": {
      const items = await fetchBlogListForSitemap();
      return buildEntitySitemapEntries(ctx.origin, "", items);
    }
    default:
      return [];
  }
}
