import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

export const recordPatientMutationLogs = async ({
  tableName,
  authContext,
  action,
  patient,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName =
    patient?.fullName || logData?.fullName || patient?.email || "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: patient?.id,
      email: patient?.email ?? logData?.email,
      fullName: targetName,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.PATIENT,
    targetEntityId: patient?.id ?? logData?.id ?? "",
    targetName,
    clinicId: logData?.clinicId ?? null,
    orgRootId: logData?.orgRootId ?? null,
  });
};

export const logPatientCreate = (params) =>
  recordPatientMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logPatientUpdate = (params) =>
  recordPatientMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logPatientDelete = (params) =>
  recordPatientMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
