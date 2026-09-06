const HTML_TAG_RE = /<[^>]*>/g;
const WHITESPACE_RE = /\s+/g;

export function stripHtml(value: string): string {
  return value.replace(HTML_TAG_RE, " ").replace(WHITESPACE_RE, " ").trim();
}

export function truncate(value: string, maxLength = 160): string {
  if (value.length <= maxLength) {
    return value;
  }

  const trimmed = value.slice(0, maxLength - 1).trimEnd();
  const lastSpace = trimmed.lastIndexOf(" ");
  const safe =
    lastSpace > maxLength * 0.6 ? trimmed.slice(0, lastSpace) : trimmed;

  return `${safe}…`;
}

export function toAbsoluteUrl(origin: string, pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) {
    return undefined;
  }

  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return new URL(path, origin).toString();
}

export function buildCanonicalUrl(origin: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, origin).toString();
}

export function capitalizeFirst(value: string): string {
  const trimmed = value.trimStart();
  if (!trimmed) {
    return value;
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Capitalize the first letter of each ` | `-separated title segment. */
export function capitalizePageTitle(title: string): string {
  return title
    .split(" | ")
    .map((segment) => capitalizeFirst(segment))
    .join(" | ");
}

export function formatRating(avgRating?: number): string | undefined {
  if (avgRating == null || Number.isNaN(avgRating)) {
    return undefined;
  }

  return avgRating.toFixed(1);
}
