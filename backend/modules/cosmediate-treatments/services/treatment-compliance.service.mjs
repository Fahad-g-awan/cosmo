import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

const recordTreatmentMutationLogs = async ({
  tableName,
  authContext,
  action,
  treatment,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = treatment?.name ?? logData?.name ?? "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: treatment?.id,
      name: targetName,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.TREATMENT,
    targetEntityId: treatment?.id ?? logData?.id ?? "",
    targetName,
    clinicId: null,
    orgRootId: null,
  });
};

export const logTreatmentCreate = (params) =>
  recordTreatmentMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logTreatmentUpdate = (params) =>
  recordTreatmentMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logTreatmentDelete = (params) =>
  recordTreatmentMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
