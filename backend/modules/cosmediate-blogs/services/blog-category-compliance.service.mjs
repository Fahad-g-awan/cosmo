import { recordComplianceLogs } from "/opt/nodejs/services/dynamodb/compliance-logs.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { authActorFromContext } from "../lib/auth-actor.mjs";

export const recordBlogCategoryMutationLogs = async ({
  tableName,
  authContext,
  action,
  category,
  logData = {},
}) => {
  const authActor = authActorFromContext(authContext);
  const targetName = category?.name || logData?.name || "";

  return recordComplianceLogs(tableName, {
    authActor,
    logData: {
      id: category?.id,
      name: targetName,
      published: category?.published ?? logData?.published,
      ...logData,
    },
    action,
    scope: ENTITY_TYPE.BLOG_CATEGORY,
    targetEntityId: category?.id ?? logData?.id ?? "",
    targetName,
    clinicId: null,
    orgRootId: null,
  });
};

export const logBlogCategoryCreate = (params) =>
  recordBlogCategoryMutationLogs({
    ...params,
    action: AUDIT_LOG_ACTION.CREATE,
  });

export const logBlogCategoryUpdate = (params) =>
  recordBlogCategoryMutationLogs({
    ...params,
    action: AUDIT_LOG_ACTION.UPDATE,
  });

export const logBlogCategoryDelete = (params) =>
  recordBlogCategoryMutationLogs({
    ...params,
    action: AUDIT_LOG_ACTION.DELETE,
  });
