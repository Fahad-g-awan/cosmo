import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

const recordClinicTreatmentMutationLogs = async ({
  tableName,
  authContext,
  action,
  clinicTreatment,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const clinicId = clinicTreatment?.clinicId ?? logData?.clinicId ?? null;
  const targetName =
    clinicTreatment?.clinicName ??
    logData?.clinicName ??
    clinicTreatment?.treatmentName ??
    logData?.treatmentName ??
    "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      ...(clinicTreatment?.id ? { id: clinicTreatment.id } : {}),
      clinicId,
      clinicName: targetName,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.CLINIC,
    targetEntityId: clinicId ?? "",
    targetName,
    clinicId,
    orgRootId: logData?.orgRootId ?? null,
  });
};

export const logClinicTreatmentSync = (params) =>
  recordClinicTreatmentMutationLogs({
    ...params,
    action: AUDIT_LOG_ACTION.TREATMENT_SELECTION,
  });
