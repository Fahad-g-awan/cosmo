import {
  buildActivityMonitoringItem,
  createActivityMonitoring,
} from "./activity-monitoring.mjs";
import { handlePutCommand } from "../../lib/db/dynamodb/commands/put.mjs";
import { createAuditLog, buildAuditLogItem } from "./audit-log.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../../lib/errors/http-error.mjs";

/**
 * Records compliance logs in the audit log and activity monitoring tables.
 *
 * @param {string} tableName
 * @param {object} params
 * @param {object} params.authActor
 * @param {object} [params.logData]
 * @param {string} params.action
 * @param {string} params.scope - target ENTITY_TYPE
 * @param {string} params.targetEntityId
 * @param {string} [params.targetName]
 * @param {string} [params.feedLine]
 * @param {string | null} [params.clinicId]
 * @param {string | null} [params.orgRootId]
 */
export const recordComplianceLogs = async (tableName, params) => {
  const {
    authActor,
    logData,
    action,
    scope,
    targetEntityId,
    targetName,
    feedLine,
    clinicId = null,
    orgRootId = null,
  } = params;

  try {
    const auditItem = buildAuditLogItem({
      authActor,
      logData,
      action,
      entity: scope,
      clinicId,
      orgRootId,
    });
    const activityItem = buildActivityMonitoringItem({
      authActor,
      logData,
      action,
      scope,
      targetEntityId,
      targetName,
      feedLine,
      clinicId,
      orgRootId,
    });

    await Promise.all([
      handlePutCommand(tableName, auditItem),
      handlePutCommand(tableName, activityItem),
    ]);

    return { auditItem, activityItem };
  } catch (error) {
    console.error("[compliance-logs] write failed:", error);

    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      message: "Something went wrong",
      details: ["Failed to record compliance logs"],
    });
  }
};

export { createAuditLog, createActivityMonitoring };
