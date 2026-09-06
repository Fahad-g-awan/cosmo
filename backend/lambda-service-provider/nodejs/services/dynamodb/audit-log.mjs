import { DateTime } from "luxon";

import { DDB_GSI_KEYS } from "../../constants/db/dynamodb/gsi-keys.constants.mjs";
import { handlePutCommand } from "../../lib/db/dynamodb/commands/put.mjs";
import { ENTITY_TYPE } from "../../constants/db/entity-types.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../../lib/errors/http-error.mjs";
import { generateId } from "../../lib/db/record.utils.mjs";
import { buildLogTimeIndexKeys } from "./log-index-keys.mjs";

/**
 * Builds a DynamoDB item for the audit log table.
 *
 * @param {object} params
 * @param {object} params.authActor - { actorId, actorEmail, actorSub, actorRole, ... }
 * @param {object} params.logData
 * @param {string} params.action
 * @param {string} params.entity - affected ENTITY_TYPE (e.g. ENTITY_TYPE#ADMIN)
 * @param {string | null} [params.clinicId]
 * @param {string | null} [params.orgRootId]
 */
export const buildAuditLogItem = ({
  authActor,
  logData,
  action,
  entity,
  clinicId = null,
  orgRootId = null,
}) => {
  const logId = generateId();
  const now = DateTime.utc().toISO();
  const actorRole = authActor.actorRole ?? authActor.role ?? "";
  const resolvedClinicId = clinicId ? String(clinicId).trim() : "";
  const resolvedOrgRootId = orgRootId ? String(orgRootId).trim() : "";

  return {
    PK: `AUDIT_LOG#ACTOR#${authActor.actorId}`,
    SK: `AUDIT_LOG#${logId}`,
    id: logId,
    entityType: ENTITY_TYPE.AUDIT_LOG,
    createdAt: now,
    updatedAt: now,
    deletedAt: "",
    deleted: false,

    ...authActor,
    actorRole,

    action,
    entity,
    logData,
    clinicId: resolvedClinicId || null,
    orgRootId: resolvedOrgRootId || null,

    GSI1PK: `AUDIT_LOG#${logId}`,
    GSI1SK: ENTITY_TYPE.AUDIT_LOG,

    GSI3PK: ENTITY_TYPE.AUDIT_LOG,
    GSI3SK: DDB_GSI_KEYS.GSI3SK_SEARCH_ENTITY_TYPE,

    GSI5PK: `ACTOR#${authActor.actorId}`,
    GSI5SK: ENTITY_TYPE.AUDIT_LOG,

    ...buildLogTimeIndexKeys({
      kind: "audit",
      id: logId,
      timestamp: now,
      clinicId: resolvedClinicId || null,
      orgRootId: resolvedOrgRootId || null,
    }),
  };
};

/**
 * @param {object} params
 * @param {string} params.tableName
 * @param {object} params.authActor
 * @param {object} [params.logData]
 * @param {string} params.action
 * @param {string} params.entity - affected ENTITY_TYPE
 * @param {string | null} [params.clinicId]
 * @param {string | null} [params.orgRootId]
 */
export const createAuditLog = async ({
  tableName,
  authActor,
  logData = {},
  action,
  entity,
  clinicId = null,
  orgRootId = null,
}) => {
  try {
    const item = buildAuditLogItem({
      authActor,
      logData,
      action,
      entity,
      clinicId,
      orgRootId,
    });
    await handlePutCommand(tableName, item);
    return item;
  } catch (error) {
    console.error("[audit-log] create failed:", error);

    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      message: "Something went wrong",
      details: ["Failed to create logs"],
    });
  }
};
