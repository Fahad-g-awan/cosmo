import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

const serializeComplianceValue = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return undefined;
  return value;
};

const buildAnnouncementLogData = (announcement, logData = {}) => {
  const targetName = announcement?.title || logData?.title || "";
  const merged = {
    id: announcement?.id ?? logData?.id,
    title: targetName,
    status: announcement?.status ?? logData?.status,
    severity: announcement?.severity ?? logData?.severity,
    priority: announcement?.priority ?? logData?.priority,
    ...logData,
  };

  const safe = {};
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined) continue;
    const serialized = serializeComplianceValue(value);
    if (serialized !== undefined) {
      safe[key] = serialized;
    }
  }

  return safe;
};

const recordAnnouncementMutationLogs = async ({
  tableName,
  authContext,
  action,
  announcement,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = announcement?.title || logData?.title || "";
  const safeLogData = buildAnnouncementLogData(announcement, logData);

  return recordComplianceLogs(tableName, {
    authActor,
    logData: safeLogData,
    action,
    scope: ENTITY_TYPE.ANNOUNCEMENT,
    targetEntityId: announcement?.id ?? logData?.id ?? "",
    targetName,
    clinicId: null,
    orgRootId: null,
  });
};

export const logAnnouncementCreate = (params) =>
  recordAnnouncementMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logAnnouncementUpdate = (params) =>
  recordAnnouncementMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logAnnouncementDelete = (params) =>
  recordAnnouncementMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
