import type { NextRequest } from "next/server";

import { getAuthSelfUrl } from "@cosmediate/config";

/** Origin for auth IdP → backend API calls (backend validates allowed origins). */
export function resolveBackendOrigin(request: NextRequest): string {
  const origin = request.headers.get("Origin");
  if (origin) return origin;

  const referer = request.headers.get("Referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      /* fall through */
    }
  }

  try {
    return getAuthSelfUrl();
  } catch {
    const host = request.headers.get("Host");
    if (!host) return "http://localhost:3002";
    const isLocal =
      host.includes("localhost") || host.includes("127.0.0.1");
    return `${isLocal ? "http" : "https"}://${host}`;
  }
}
