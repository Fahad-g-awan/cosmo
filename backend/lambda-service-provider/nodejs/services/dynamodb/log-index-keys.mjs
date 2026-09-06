import { ENTITY_TYPE } from "../../constants/db/entity-types.mjs";

const buildTimeSortKey = (timestamp, id) => `${timestamp}#${id}`;

/**
 * @param {object} params
 * @param {"audit" | "activity"} params.kind
 * @param {string} params.id
 * @param {string} params.timestamp
 * @param {string | null | undefined} params.clinicId
 * @param {string | null | undefined} params.orgRootId
 */
export const buildLogTimeIndexKeys = ({
  kind,
  id,
  timestamp,
  clinicId,
  orgRootId,
}) => {
  const entityType =
    kind === "audit"
      ? ENTITY_TYPE.AUDIT_LOG
      : ENTITY_TYPE.ACTIVITY_MONITORING;

  const prefix = kind === "audit" ? "AUDIT_LOG" : "ACTIVITY_MONITORING";
  const sortKey = buildTimeSortKey(timestamp, id);

  const keys = {
    GSI6PK: entityType,
    GSI6SK: sortKey,
  };

  if (clinicId) {
    keys.GSI8PK = `CLINIC#${clinicId}#${prefix}`;
    keys.GSI8SK = sortKey;
  }

  if (orgRootId) {
    keys.GSI9PK = `ORG#${orgRootId}#${prefix}`;
    keys.GSI9SK = sortKey;
  }

  return keys;
};
