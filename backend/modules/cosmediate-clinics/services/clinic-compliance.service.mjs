import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

const recordClinicMutationLogs = async ({
  tableName,
  authContext,
  action,
  clinic,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = clinic?.name ?? logData?.name ?? "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: clinic?.id,
      name: targetName,
      email: clinic?.email ?? logData?.email,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.CLINIC,
    targetEntityId: clinic?.id ?? logData?.id ?? "",
    targetName,
    clinicId: clinic?.id ?? logData?.id ?? null,
    orgRootId: clinic?.parentClinicId ?? clinic?.id ?? null,
  });
};

export const logClinicCreate = (params) =>
  recordClinicMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logClinicUpdate = (params) =>
  recordClinicMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logClinicDelete = (params) =>
  recordClinicMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
