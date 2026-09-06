import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

const recordBrandMutationLogs = async ({
  tableName,
  authContext,
  action,
  brand,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = brand?.name ?? logData?.name ?? "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: brand?.id,
      name: targetName,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.TREATMENT_BRAND,
    targetEntityId: brand?.id ?? logData?.id ?? "",
    targetName,
    clinicId: null,
    orgRootId: null,
  });
};

export const logBrandCreate = (params) =>
  recordBrandMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logBrandUpdate = (params) =>
  recordBrandMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logBrandDelete = (params) =>
  recordBrandMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
