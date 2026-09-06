import { REVALIDATE, resolveEntityFetchInit } from "../cache/revalidate";
import { buildBackendRequestHeaders } from "./request-headers";

interface ListApiResponse<T> {
  success: boolean;
  items?: T[];
  nextToken?: string;
}

export interface SitemapEntityRef {
  id: string;
  updatedAt?: string;
}

function getBackendBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  return baseUrl.replace(/\/+$/, "");
}

async function fetchAllListItems<T extends SitemapEntityRef>(
  path: string,
  filters: Record<string, unknown> = {},
): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | undefined;

  do {
    const requestHeaders = await buildBackendRequestHeaders({
      "Content-Type": "application/json",
    });
    const response = await fetch(`${getBackendBaseUrl()}${path}`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        filters,
        pagination: {
          limit: 100,
          ...(nextToken ? { nextToken } : {}),
        },
      }),
      ...resolveEntityFetchInit({ revalidate: REVALIDATE.sitemap }),
    });

    if (!response.ok) {
      break;
    }

    const data = (await response.json()) as ListApiResponse<T>;
    if (!data.success || !data.items?.length) {
      break;
    }

    items.push(...data.items);
    nextToken = data.nextToken;
  } while (nextToken);

  return items;
}

export function fetchClinicListForSitemap(): Promise<SitemapEntityRef[]> {
  return fetchAllListItems<SitemapEntityRef>("/clinics/list", {
    status: "ACTIVE",
  });
}

export function fetchSpecialistListForSitemap(): Promise<SitemapEntityRef[]> {
  return fetchAllListItems<SitemapEntityRef>("/specialists/list", {
    status: "ACTIVE",
  });
}

export function fetchTreatmentListForSitemap(): Promise<SitemapEntityRef[]> {
  return fetchAllListItems<SitemapEntityRef>("/treatments/list", {
    published: true,
  });
}

export function fetchBlogListForSitemap(): Promise<SitemapEntityRef[]> {
  return fetchAllListItems<SitemapEntityRef>("/blogs/list", {
    status: "PUBLISHED",
  });
}
