import type { Blog, Clinic, Specialist, Treatment } from "@cosmediate/type-utils";

import {
  type EntityFetchCache,
  REVALIDATE,
  resolveEntityFetchInit,
} from "../cache/revalidate";
import { buildBackendRequestHeaders } from "./request-headers";

interface ApiItemResponse<T> {
  success: boolean;
  item?: T | null;
}

interface FetchEntityOptions {
  cache?: EntityFetchCache;
}

function getBackendBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  return baseUrl.replace(/\/+$/, "");
}

async function fetchEntity<T>(
  path: string,
  { cache = "no-store" }: FetchEntityOptions = {},
): Promise<T | null> {
  const requestHeaders = await buildBackendRequestHeaders();
  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    headers: requestHeaders,
    ...resolveEntityFetchInit(cache),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as ApiItemResponse<T>;
  return data.success && data.item ? data.item : null;
}

export function fetchClinicServer(
  id: string,
  options?: FetchEntityOptions,
): Promise<Clinic | null> {
  return fetchEntity<Clinic>(
    `/clinics?id=${encodeURIComponent(id)}&from=listing`,
    options,
  );
}

export function fetchSpecialistServer(
  id: string,
  options?: FetchEntityOptions,
): Promise<Specialist | null> {
  return fetchEntity<Specialist>(
    `/specialists?id=${encodeURIComponent(id)}&from=listing`,
    options,
  );
}

export function fetchTreatmentServer(
  id: string,
  options?: FetchEntityOptions,
): Promise<Treatment | null> {
  return fetchEntity<Treatment>(
    `/treatments?id=${encodeURIComponent(id)}&from=listing`,
    options,
  );
}

export function fetchBlogServer(
  id: string,
  options: FetchEntityOptions = {
    cache: { revalidate: REVALIDATE.blog.post },
  },
): Promise<Blog | null> {
  return fetchEntity<Blog>(
    `/blogs?id=${encodeURIComponent(id)}&from=listing`,
    options,
  );
}
