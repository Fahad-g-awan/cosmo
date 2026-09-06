import { resolvePersonDisplayName } from "../../../services/dynamodb/activity-feed.utils.mjs";

/**
 * Extract display name and email from an auth context.
 *
 * @param {Record<string, unknown> | null | undefined} authContext
 * @returns {{ actorName: string, actorEmail: string, actorRole: string }}
 */
export const actorContextFromAuth = (authContext) => ({
  actorName:
    resolvePersonDisplayName({
      fullName: authContext?.fullName,
      firstName: authContext?.firstName,
      lastName: authContext?.lastName,
    }) ||
    authContext?.email ||
    "Someone",
  actorEmail: String(authContext?.email ?? ""),
  actorRole: String(authContext?.role ?? ""),
});

/**
 * Standard admin audit email payload (actor, entity, timestamp).
 *
 * @param {{
 *   authContext?: Record<string, unknown> | null,
 *   entityType: string,
 *   entityLabel: string,
 *   entityId?: string,
 * }} params
 * @returns {Record<string, unknown>}
 */
export const adminAuditPayload = ({
  authContext,
  entityType,
  entityLabel,
  entityId,
}) => {
  const { actorName, actorEmail } = actorContextFromAuth(authContext);

  return {
    actorName,
    actorEmail,
    entityType,
    entityLabel,
    entityId,
    occurredAt: new Date().toISOString(),
  };
};
