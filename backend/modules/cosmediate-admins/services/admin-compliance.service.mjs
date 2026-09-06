import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

export const recordAdminMutationLogs = async ({
  tableName,
  authContext,
  action,
  admin,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = admin?.fullName || logData?.fullName || admin?.email || "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: admin?.id,
      email: admin?.email ?? logData?.email,
      fullName: targetName,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.ADMIN,
    targetEntityId: admin?.id ?? logData?.id ?? "",
    targetName,
    clinicId: null,
    orgRootId: null,
  });
};

export const logAdminCreate = (params) =>
  recordAdminMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logAdminUpdate = (params) =>
  recordAdminMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logAdminDelete = (params) =>
  recordAdminMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
