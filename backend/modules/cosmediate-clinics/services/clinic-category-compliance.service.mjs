import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

const recordCategoryMutationLogs = async ({
  tableName,
  authContext,
  action,
  category,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = category?.name ?? logData?.name ?? "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: category?.id,
      name: targetName,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.CLINIC_CATEGORY,
    targetEntityId: category?.id ?? logData?.id ?? "",
    targetName,
    clinicId: null,
    orgRootId: null,
  });
};

export const logCategoryCreate = (params) =>
  recordCategoryMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logCategoryUpdate = (params) =>
  recordCategoryMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logCategoryDelete = (params) =>
  recordCategoryMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
