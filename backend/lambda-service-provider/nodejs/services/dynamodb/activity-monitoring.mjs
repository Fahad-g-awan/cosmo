import { DateTime } from "luxon";

import {
  buildActivityFeedLine,
  normalizeActorDisplayName,
  resolvePersonDisplayName,
} from "./activity-feed.utils.mjs";
import { DDB_GSI_KEYS } from "../../constants/db/dynamodb/gsi-keys.constants.mjs";
import { handlePutCommand } from "../../lib/db/dynamodb/commands/put.mjs";
import { ENTITY_TYPE } from "../../constants/db/entity-types.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../../lib/errors/http-error.mjs";
import { generateId } from "../../lib/db/record.utils.mjs";
import { buildLogTimeIndexKeys } from "./log-index-keys.mjs";

/**
 * Builds a DynamoDB item for the activity monitoring table.
 */
export const buildActivityMonitoringItem = ({
  authActor,
  logData = {},
  action,
  scope,
  targetEntityId,
  targetName = "",
  feedLine,
  clinicId = null,
  orgRootId = null,
}) => {
  const logId = generateId();
  const occurredAt = DateTime.utc().toISO();
  const actorDisplayName = normalizeActorDisplayName(authActor);
  const actorRole = authActor.actorRole ?? authActor.role ?? "";
  const resolvedClinicId = clinicId ? String(clinicId).trim() : "";
  const resolvedOrgRootId = orgRootId ? String(orgRootId).trim() : "";
  const resolvedTargetName =
    resolvePersonDisplayName({
      fullName:
        targetName || logData?.targetName || logData?.fullName || logData?.name,
      firstName: logData?.firstName,
      lastName: logData?.lastName,
      email: logData?.email,
    }) ||
    String(
      targetName ||
        logData?.targetName ||
        logData?.fullName ||
        logData?.name ||
        "",
    ).trim();
  const line =
    feedLine ??
    buildActivityFeedLine({
      actorDisplayName,
      actorId: authActor.actorId ?? "",
      actorEmail: authActor.actorEmail ?? "",
      action,
      scope,
      targetName: resolvedTargetName,
      targetEntityId,
      logData,
    });

  return {
    PK: `ACTIVITY_MONITORING#${scope}`,
    SK: `ACTIVITY_MONITORING#${logId}`,
    id: logId,
    entityType: ENTITY_TYPE.ACTIVITY_MONITORING,
    createdAt: occurredAt,
    updatedAt: occurredAt,
    occurredAt,
    deletedAt: "",
    deleted: false,

    actorId: authActor.actorId ?? "",
    actorEmail: authActor.actorEmail ?? "",
    actorSub: authActor.actorSub ?? "",
    actorRole,
    actorDisplayName,

    action,
    scope,
    targetEntityId,
    targetName: resolvedTargetName,
    feedLine: line,
    logData,
    clinicId: resolvedClinicId || null,
    orgRootId: resolvedOrgRootId || null,

    GSI1PK: `ACTIVITY_MONITORING#${logId}`,
    GSI1SK: ENTITY_TYPE.ACTIVITY_MONITORING,

    GSI3PK: ENTITY_TYPE.ACTIVITY_MONITORING,
    GSI3SK: DDB_GSI_KEYS.GSI3SK_SEARCH_ENTITY_TYPE,

    GSI5PK: `ACTOR#${authActor.actorId ?? ""}`,
    GSI5SK: ENTITY_TYPE.ACTIVITY_MONITORING,

    ...buildLogTimeIndexKeys({
      kind: "activity",
      id: logId,
      timestamp: occurredAt,
      clinicId: resolvedClinicId || null,
      orgRootId: resolvedOrgRootId || null,
    }),
  };
};

/**
 * Creates an activity monitoring item in the activity monitoring table.
 */
export const createActivityMonitoring = async ({
  tableName,
  authActor,
  logData = {},
  action,
  scope,
  targetEntityId,
  targetName,
  feedLine,
  clinicId = null,
  orgRootId = null,
}) => {
  try {
    const item = buildActivityMonitoringItem({
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

    await handlePutCommand(tableName, item);
    return item;
  } catch (error) {
    console.error("[activity-monitoring] create failed:", error);

    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      message: "Something went wrong",
      details: ["Failed to create activity monitoring record"],
    });
  }
};
