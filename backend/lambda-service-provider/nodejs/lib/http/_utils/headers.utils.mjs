export const normalizeHeaders = (headers = {}) =>
  Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
  );

export const isJsonContentType = (contentType) =>
  /^application\/json\b/i.test(contentType);

export const isMultipartContentType = (contentType) =>
  /^multipart\/form-data\b/i.test(contentType);

export const getAuthToken = (event) => {
  const authHeader =
    event.headers?.authorization || event.headers?.Authorization || "";
  const authToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return authToken ?? null;
};

const parseCookie = (cookieHeader = "") => {
  const obj = {};

  cookieHeader.split(";").forEach((part) => {
    const [rawName, ...rest] = part.split("=");
    if (!rawName) return;

    const name = decodeURIComponent(rawName.trim());
    const value = rest.join("=").trim();

    obj[name] = decodeURIComponent(value);
  });

  return obj;
};

/** HTTP API v2 exposes `event.cookies[]`; REST / some proxies use `Cookie` header. */
export const getEventCookies = (event) => {
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie || "";
  const parts = cookieHeader ? [cookieHeader] : [];

  if (Array.isArray(event.cookies)) {
    for (const entry of event.cookies) {
      if (typeof entry === "string" && entry.trim()) {
        parts.push(entry.trim());
      }
    }
  }

  return parseCookie(parts.join("; "));
};

export const getSessionId = (event) => {
  const cookies = getEventCookies(event);
  const sessionId = cookies["session_id"];

  return sessionId ?? null;
};
