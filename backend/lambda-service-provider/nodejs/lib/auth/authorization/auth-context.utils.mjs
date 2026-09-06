const parseMaybeJsonObject = (value) => {
  if (value == null) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;

  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
};

const isDenyContext = (ctx) => {
  if (!ctx || typeof ctx !== "object") return true;

  const hasIdentity =
    ctx.cognitoSub || ctx.sub || ctx.identityId || ctx.principalId;

  return Boolean(ctx.reason) && !hasIdentity;
};

/**
 * Normalize authorizer context fields from API Gateway (all string values).
 *
 * @param {object | null | undefined} raw
 * @returns {object | null}
 */
export const normalizeAuthorizerContext = (raw) => {
  if (!raw || typeof raw !== "object" || isDenyContext(raw)) return null;

  const cognitoSub =
    raw.cognitoSub ?? raw.sub ?? raw.principalId ?? null;
  const identityId = raw.identityId ?? null;

  return {
    ...raw,
    cognitoSub: cognitoSub ? String(cognitoSub) : null,
    identityId: identityId ? String(identityId) : null,
    email: raw.email ?? "",
    role: raw.role ?? "",
    entityId: raw.entityId ?? "",
    perms: raw.perms ?? "",
  };
};

/**
 * Gets the authorizer context from the event.
 *
 * HTTP API Lambda authorizers may nest context under `authorizer.lambda`
 * (payload 2.0) or flatten it on `authorizer`.
 *
 * @param {object} event - The event.
 * @returns {object | null} The authorizer context.
 */
export const getAuthorizerContext = (event) => {
  const authorizer = event.requestContext?.authorizer;
  if (!authorizer) return null;

  const lambdaCtx = parseMaybeJsonObject(authorizer.lambda);

  return (
    normalizeAuthorizerContext(lambdaCtx) ??
    normalizeAuthorizerContext(authorizer)
  );
};
