import {
  encodeToken,
  decodeToken,
} from "/opt/nodejs/lib/encoding/base64-json.codec.mjs";
import { DDB_INDEX_NAMES } from "/opt/nodejs/constants/db/dynamodb/index-names.constants.mjs";
import { handleQueryCommand } from "/opt/nodejs/lib/db/dynamodb/commands/query.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

const LOG_KIND = {
  audit: {
    entityType: ENTITY_TYPE.AUDIT_LOG,
    prefix: "AUDIT_LOG",
    scopeField: "entity",
    timestampField: "createdAt",
    searchFields: ["actorEmail", "actorDisplayName"],
  },
  activity: {
    entityType: ENTITY_TYPE.ACTIVITY_MONITORING,
    prefix: "ACTIVITY_MONITORING",
    scopeField: "scope",
    timestampField: "occurredAt",
    searchFields: ["feedLine", "targetName", "actorDisplayName", "actorEmail"],
  },
};

const normalizeLimit = (limit) => {
  const parsed = Number(limit ?? 20);
  if (!Number.isFinite(parsed) || parsed < 1) return 20;
  return Math.min(parsed, 100);
};

const pickScalarFilter = (value) => {
  if (Array.isArray(value)) {
    const first = value.find((entry) => entry != null && entry !== "");
    return first !== undefined ? String(first) : null;
  }
  if (value == null || value === "") return null;
  return String(value);
};

const buildFilterExpression = ({
  kindConfig,
  filters = {},
  search,
  listScope,
}) => {
  const expressions = [
    "(attribute_not_exists(#deleted) OR #deleted = :deleted)",
  ];
  const names = { "#deleted": "deleted" };
  const values = { ":deleted": false };

  if (listScope?.managerActorOnly) {
    expressions.push("actorRole = :managerRole");
    values[":managerRole"] = USER_ROLES.MANAGER;
  }

  const actorId = pickScalarFilter(filters?.actorId);
  if (actorId) {
    expressions.push("actorId = :actorId");
    values[":actorId"] = actorId;
  }

  const scopeValue = pickScalarFilter(filters?.scope);
  if (scopeValue) {
    const field = kindConfig.scopeField;
    expressions.push(`#scopeField = :scopeValue`);
    names["#scopeField"] = field;
    values[":scopeValue"] = scopeValue;
  }

  const actionValue = pickScalarFilter(filters?.action);
  if (actionValue) {
    expressions.push("#action = :action");
    names["#action"] = "action";
    values[":action"] = actionValue;
  }

  const createdAt = filters?.createdAt;
  if (Array.isArray(createdAt) && createdAt.length === 2) {
    const [from, to] = createdAt;
    if (from && to) {
      expressions.push("#ts BETWEEN :from AND :to");
      names["#ts"] = kindConfig.timestampField;
      values[":from"] = from;
      values[":to"] = to;
    } else if (from) {
      expressions.push("#ts >= :from");
      names["#ts"] = kindConfig.timestampField;
      values[":from"] = from;
    } else if (to) {
      expressions.push("#ts <= :to");
      names["#ts"] = kindConfig.timestampField;
      values[":to"] = to;
    }
  }

  const queryText = search?.query?.trim?.();
  if (queryText) {
    const searchParts = kindConfig.searchFields.map((field, index) => {
      const nameKey = `#search${index}`;
      const valueKey = `:search${index}`;
      names[nameKey] = field;
      values[valueKey] = queryText;
      return `contains(${nameKey}, ${valueKey})`;
    });
    expressions.push(`(${searchParts.join(" OR ")})`);
  }

  if (listScope?.mode === "clinic" && !actorId) {
    if (listScope.orgWide && listScope.rootId) {
      expressions.push("orgRootId = :scopedOrgRootId");
      values[":scopedOrgRootId"] = listScope.rootId;
    }

    const clinicIds = listScope.effectiveClinicIds ?? [];
    if (clinicIds.length === 1) {
      expressions.push("clinicId = :scopedClinicId0");
      values[":scopedClinicId0"] = clinicIds[0];
    } else if (clinicIds.length > 1) {
      const clinicParts = clinicIds.map((clinicId, index) => {
        const valueKey = `:scopedClinicId${index}`;
        values[valueKey] = clinicId;
        return `clinicId = ${valueKey}`;
      });
      expressions.push(`(${clinicParts.join(" OR ")})`);
    }
  }

  return {
    FilterExpression: expressions.join(" AND "),
    ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
    ExpressionAttributeValues: values,
  };
};

const sortItemsByTime = (items, kind, order = "desc") => {
  const field = kind === "audit" ? "createdAt" : "occurredAt";
  return [...items].sort((left, right) => {
    const leftTs = left?.[field] ?? "";
    const rightTs = right?.[field] ?? "";
    return order === "asc"
      ? leftTs.localeCompare(rightTs)
      : rightTs.localeCompare(leftTs);
  });
};

/**
 * List queries use GSIs — not table PK.
 * - actorId filter → GSI5 (ACTOR#id + entity type)
 * - global / unscoped lists → GSI6 (time-ordered per log kind)
 * - legacy rows without GSI6 are omitted from global lists
 */
const resolveQueryTarget = ({ kind, filters = {}, sort }) => {
  const kindConfig = LOG_KIND[kind];
  const actorId = pickScalarFilter(filters?.actorId);

  if (actorId) {
    return {
      indexName: DDB_INDEX_NAMES.GSI5,
      keyCondition: {
        GSI5PK: `ACTOR#${actorId}`,
        GSI5SK: kindConfig.entityType,
      },
      sortInMemory: true,
    };
  }

  return {
    indexName: DDB_INDEX_NAMES.GSI6,
    keyCondition: {
      GSI6PK: kindConfig.entityType,
    },
    sortInMemory: false,
    scanIndexForward: sort?.order === "asc",
  };
};

const runQueryPage = async ({
  tableName,
  kind,
  listScope,
  filters,
  search,
  pagination,
  sort,
}) => {
  const kindConfig = LOG_KIND[kind];
  const limit = normalizeLimit(pagination?.limit);
  const fetchLimit = limit + 1;
  const target = resolveQueryTarget({ kind, filters, sort });
  const filter = buildFilterExpression({
    kindConfig,
    filters,
    search,
    listScope,
  });

  const keyNames = Object.keys(target.keyCondition);
  const keyConditionExpression = keyNames
    .map((name) => `${name} = :${name}`)
    .join(" AND ");

  const expressionAttributeValues = {
    ...filter.ExpressionAttributeValues,
    ...Object.fromEntries(
      keyNames.map((name) => [`:${name}`, target.keyCondition[name]]),
    ),
  };

  const query = {
    TableName: tableName,
    IndexName: target.indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ScanIndexForward: target.scanIndexForward ?? false,
    Limit: fetchLimit,
    ...(filter.FilterExpression
      ? { FilterExpression: filter.FilterExpression }
      : {}),
    ...(filter.ExpressionAttributeNames
      ? { ExpressionAttributeNames: filter.ExpressionAttributeNames }
      : {}),
  };

  const startKey = decodeToken(pagination?.nextToken);
  if (startKey) {
    query.ExclusiveStartKey = startKey;
  }

  const response = await handleQueryCommand(query);
  let items = response.Items ?? [];

  if (target.sortInMemory) {
    items = sortItemsByTime(items, kind, sort?.order ?? "desc");
  }

  if (items.length > limit) {
    items = items.slice(0, limit);
  }

  const nextToken = response.LastEvaluatedKey
    ? encodeToken(response.LastEvaluatedKey)
    : null;

  return { items, nextToken };
};

/**
 * @param {object} params
 * @param {string} params.tableName
 * @param {"audit" | "activity"} params.kind
 * @param {object} params.listScope
 * @param {object} [params.filters]
 * @param {object} [params.search]
 * @param {object} [params.pagination]
 * @param {object} [params.sort]
 */
export const queryPlatformLogs = async ({
  tableName,
  kind,
  listScope,
  filters = {},
  search,
  pagination = {},
  sort = { by: "createdAt", order: "desc" },
}) => {
  return runQueryPage({
    tableName,
    kind,
    listScope,
    filters,
    search,
    pagination,
    sort,
  });
};
