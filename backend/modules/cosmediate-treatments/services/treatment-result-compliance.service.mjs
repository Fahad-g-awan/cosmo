import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

const recordTreatmentResultMutationLogs = async ({
  tableName,
  authContext,
  action,
  treatmentResult,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName =
    treatmentResult?.treatmentName ??
    treatmentResult?.description ??
    logData?.description ??
    "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: treatmentResult?.id,
      description: treatmentResult?.description ?? logData?.description,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.TREATMENT_RESULT,
    targetEntityId: treatmentResult?.id ?? logData?.id ?? "",
    targetName,
    clinicId: treatmentResult?.clinicId ?? null,
    orgRootId: null,
  });
};

export const logTreatmentResultCreate = (params) =>
  recordTreatmentResultMutationLogs({
    ...params,
    action: AUDIT_LOG_ACTION.CREATE,
  });

export const logTreatmentResultUpdate = (params) =>
  recordTreatmentResultMutationLogs({
    ...params,
    action: AUDIT_LOG_ACTION.UPDATE,
  });

export const logTreatmentResultDelete = (params) =>
  recordTreatmentResultMutationLogs({
    ...params,
    action: AUDIT_LOG_ACTION.DELETE,
  });
