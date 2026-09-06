import type { MetadataRoute } from "next";

import { LISTING_PAGE_PATHS } from "../sitemap/static-pages";
import { WEB_MARKETING_PAGE_PATHS } from "../metadata/marketing";

export type SitemapSegmentId =
  | "pages"
  | "clinics"
  | "specialists"
  | "treatments"
  | "blogs";

export const WEB_SITEMAP_SEGMENTS: SitemapSegmentId[] = [
  "pages",
  "clinics",
  "specialists",
  "treatments",
];

export const BLOG_SITEMAP_SEGMENTS: SitemapSegmentId[] = ["pages", "blogs"];

export function buildStaticWebSitemapEntries(
  origin: string,
): MetadataRoute.Sitemap {
  const marketingEntries = Object.values(WEB_MARKETING_PAGE_PATHS).map((path) => ({
    url: new URL(path, origin).toString(),
    lastModified: new Date(),
    changeFrequency:
      path === "/" ? ("daily" as const) : ("weekly" as const),
    priority:
      path === "/"
        ? 1
        : path.includes("privacy") || path.includes("terms")
          ? 0.3
          : 0.6,
  }));

  const listingEntries = LISTING_PAGE_PATHS.map((path) => ({
    url: new URL(path, origin).toString(),
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...marketingEntries, ...listingEntries];
}

export function buildBlogHomeSitemapEntry(
  origin: string,
): MetadataRoute.Sitemap {
  return [
    {
      url: new URL("/", origin).toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}

export function buildEntitySitemapEntries(
  origin: string,
  pathPrefix: string,
  items: Array<{ id: string; updatedAt?: string }>,
): MetadataRoute.Sitemap {
  return items.map((item) => {
    const pathname = pathPrefix ? `${pathPrefix}/${item.id}` : `/${item.id}`;

    return {
      url: new URL(pathname, origin).toString(),
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });
}
