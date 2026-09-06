import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

const recordSpecialistMutationLogs = async ({
  tableName,
  authContext,
  action,
  specialist,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = specialist?.fullName ?? logData?.fullName ?? "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: specialist?.id,
      fullName: targetName,
      email: specialist?.email ?? logData?.email,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.SPECIALIST,
    targetEntityId: specialist?.id ?? logData?.id ?? "",
    targetName,
    clinicId: logData?.clinicId ?? logData?.parentClinicId ?? null,
    orgRootId: logData?.orgRootId ?? null,
  });
};

export const logSpecialistCreate = (params) =>
  recordSpecialistMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logSpecialistUpdate = (params) =>
  recordSpecialistMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logSpecialistDelete = (params) =>
  recordSpecialistMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
