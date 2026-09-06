import type { NextRequest } from "next/server";

/** Collect `Set-Cookie` header lines from a `fetch` `Response` (Node / undici). */
export function getSetCookieHeaderLines(res: Response): string[] {
  const headers = res.headers as unknown as {
    getSetCookie?: () => string[];
  };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

/**
 * Server-side same-origin refresh used by `proxy.ts`.
 * Single attempt — no retries.
 */
export async function fetchSameOriginSessionRefresh(
  request: NextRequest,
): Promise<{ ok: true; setCookieHeaders: string[] } | { ok: false }> {
  const url = new URL("/api/auth/refresh", request.url);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (!res.ok) {
      return { ok: false };
    }

    return {
      ok: true,
      setCookieHeaders: getSetCookieHeaderLines(res),
    };
  } catch (err) {
    console.error("[fetchSameOriginSessionRefresh]", err);
    return { ok: false };
  }
}
