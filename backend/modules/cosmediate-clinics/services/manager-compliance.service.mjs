import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

const recordManagerMutationLogs = async ({
  tableName,
  authContext,
  action,
  manager,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = manager?.fullName ?? logData?.fullName ?? "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: manager?.id,
      fullName: targetName,
      email: manager?.email ?? logData?.email,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.CLINIC_MANAGER,
    targetEntityId: manager?.id ?? logData?.id ?? "",
    targetName,
    clinicId: logData?.clinicId ?? null,
    orgRootId: logData?.orgRootId ?? null,
  });
};

export const logManagerCreate = (params) =>
  recordManagerMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logManagerUpdate = (params) =>
  recordManagerMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logManagerDelete = (params) =>
  recordManagerMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
