import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

/** Rich/large blog fields must not be stored in DynamoDB audit logs. */
const BLOG_LOG_OMIT_KEYS = new Set([
  "content",
  "image",
  "blogImage",
  "overview",
]);

const serializeComplianceValue = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return undefined;
  return value;
};

const buildBlogLogData = (blog, logData = {}) => {
  const targetName = blog?.title || logData?.title || "";
  const merged = {
    id: blog?.id ?? logData?.id,
    title: targetName,
    status: blog?.status ?? logData?.status,
    categoryId: blog?.categoryId ?? logData?.categoryId,
    ...logData,
  };

  const safe = {};
  for (const [key, value] of Object.entries(merged)) {
    if (BLOG_LOG_OMIT_KEYS.has(key) || value === undefined) continue;
    const serialized = serializeComplianceValue(value);
    if (serialized !== undefined) {
      safe[key] = serialized;
    }
  }
  return safe;
};

export const recordBlogMutationLogs = async ({
  tableName,
  authContext,
  action,
  blog,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = blog?.title || logData?.title || "";
  const safeLogData = buildBlogLogData(blog, logData);

  return recordComplianceLogs(tableName, {
    authActor,
    logData: safeLogData,
    action,
    scope: ENTITY_TYPE.BLOG,
    targetEntityId: blog?.id ?? logData?.id ?? "",
    targetName,
    clinicId: null,
    orgRootId: null,
  });
};

export const logBlogCreate = (params) =>
  recordBlogMutationLogs({ ...params, action: AUDIT_LOG_ACTION.CREATE });

export const logBlogUpdate = (params) =>
  recordBlogMutationLogs({ ...params, action: AUDIT_LOG_ACTION.UPDATE });

export const logBlogDelete = (params) =>
  recordBlogMutationLogs({ ...params, action: AUDIT_LOG_ACTION.DELETE });
