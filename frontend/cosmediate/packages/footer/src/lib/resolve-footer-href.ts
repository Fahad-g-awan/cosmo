import { getCrossAppShortcutHrefFromHostname } from "@cosmediate/config";

/**
 * Resolve footer marketing paths (`/home/…`, `/blog`) to absolute sibling-app
 * URLs — same targets as `proxy.ts` + {@link getCrossAppShortcutTargetUrl}.
 *
 * Call from `useEffect` only so SSR markup stays relative (hydration-safe).
 */
export function resolveFooterShortcutHref(url: string): string {
  if (typeof window === "undefined") return url;
  if (/^https?:\/\//i.test(url)) return url;

  let pathname: string;
  let search: string;

  try {
    const parsed = new URL(url, window.location.origin);
    pathname = parsed.pathname;
    search = parsed.search;
  } catch {
    return url;
  }

  const resolved = getCrossAppShortcutHrefFromHostname(window.location.hostname, {
    pathname,
    search,
  });

  return resolved ?? url;
}
