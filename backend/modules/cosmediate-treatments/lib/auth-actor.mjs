import { resolvePersonDisplayName } from "/opt/nodejs/services/dynamodb/activity-feed.utils.mjs";

export const authActorFromContext = (authContext) => ({
  actorId: authContext?.entityId ?? "",
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
