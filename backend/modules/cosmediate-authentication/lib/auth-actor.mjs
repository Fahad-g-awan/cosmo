import { resolvePersonDisplayName } from "/opt/nodejs/services/dynamodb/activity-feed.utils.mjs";

export const authActorFromContext = (authContext) => ({
  actorId: authContext?.entityId ?? authContext?.userId ?? "",
  actorEmail: authContext?.email ?? "",
  actorSub: authContext?.cognitoSub ?? authContext?.sub ?? "",
  actorRole: authContext?.role ?? "",
  actorDisplayName:
    resolvePersonDisplayName({
      fullName: authContext?.fullName,
      firstName: authContext?.firstName,
      lastName: authContext?.lastName,
    }) || authContext?.email || "",
});

/** Public auth routes (sign-up / sign-in) — actor is the Identity being registered or signing in. */
export const authActorFromIdentity = (identity, { displayName } = {}) => ({
  actorId: identity?.entityId ?? "",
  actorEmail: identity?.email ?? "",
  actorSub: identity?.cognitoSub ?? "",
  actorRole: identity?.role ?? "",
  actorDisplayName:
    displayName ||
    resolvePersonDisplayName({ email: identity?.email }) ||
    identity?.email ||
    "",
});
