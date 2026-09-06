/** Route segment revalidate values (seconds). Use literals in page `export const revalidate`. */
export const REVALIDATE = {
  homepage: 1800,
  blog: { post: 3600, home: 3600 },
  marketing: 86400,
  legal: 604800,
  sitemap: 3600,
} as const;

export type EntityFetchCache = "no-store" | { revalidate: number };

export function resolveEntityFetchInit(
  cache: EntityFetchCache = "no-store",
): RequestInit {
  if (cache === "no-store") {
    return { cache: "no-store" };
  }

  return { next: { revalidate: cache.revalidate } };
}
