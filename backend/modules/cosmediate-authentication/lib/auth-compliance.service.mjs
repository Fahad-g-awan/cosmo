import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { resolveIdentityDisplayName } from "/opt/nodejs/services/dynamodb/activity-feed.utils.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromIdentity } from "./auth-actor.mjs";

const SCOPE_FOR_ROLE = {
  PATIENT: ENTITY_TYPE.PATIENT,
  ADMIN: ENTITY_TYPE.ADMIN,
  SPECIALIST: ENTITY_TYPE.SPECIALIST,
  MANAGER: ENTITY_TYPE.CLINIC_MANAGER,
};

const recordAuthCompliance = async ({
  tableName,
  databaseUrl,
  identity,
  action,
  logData = {},
}) => {
  if (!tableName || !identity?.id) {
    return null;
  }

  try {
    const displayName = await resolveIdentityDisplayName(
      databaseUrl,
      identity,
      logData,
    );
    const authActor = authActorFromIdentity(identity, { displayName });

    return await recordComplianceLogs(tableName, {
      authActor,
      logData: {
        id: identity?.entityId ?? logData?.id,
        identityId: identity.id,
        email: identity?.email ?? logData?.email,
        fullName: displayName || logData?.fullName,
        ...logData,
      },
      action,
      scope: SCOPE_FOR_ROLE[identity?.role] ?? ENTITY_TYPE.PATIENT,
      targetEntityId: identity?.entityId ?? logData?.id ?? "",
      targetName: displayName || logData?.fullName || "",
    });
  } catch (error) {
    // Auth must succeed even if audit write fails — log and continue.
    console.error("[auth] compliance log failed", { action, error });
    return null;
  }
};

export const logAuthRegister = (params) =>
  recordAuthCompliance({ ...params, action: AUDIT_LOG_ACTION.REGISTER });

export const logAuthSignIn = (params) =>
  recordAuthCompliance({ ...params, action: AUDIT_LOG_ACTION.SIGN_IN });
