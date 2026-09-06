import { getEntityById } from "/opt/nodejs/services/dynamodb/entity-queries.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  toAuditLogDetail,
  toAuditLogListItem,
} from "../lib/platform-log-dto.mjs";
import { queryPlatformLogs } from "./log-list.query.mjs";
import {
  assertLogItemVisible,
  resolveLogListScope,
} from "./log-list-scope.mjs";

export const listAuditLogs = async (ctx) => {
  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.PLATFORM.AUDIT_LOGS_LIST,
    ctx.reqBody,
  );

  const listScope = await resolveLogListScope(ctx.prisma, ctx.authContext);
  const { items, nextToken } = await queryPlatformLogs({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    kind: "audit",
    listScope,
    filters: query.filters ?? {},
    search: query.search,
    pagination: query.pagination ?? {},
    sort: query.sort ?? { by: "createdAt", order: "desc" },
  });

  return {
    statusCode: 200,
    data: {
      success: true,
      items: items.map(toAuditLogListItem),
      total: null,
      nextToken,
      paginationMode: "cursor",
      ...(!items.length ? { message: "No data found" } : {}),
    },
  };
};

export const getAuditLogById = async (ctx) => {
  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid log ID in query params"],
    });
  }

  const listScope = await resolveLogListScope(ctx.prisma, ctx.authContext);
  const item = await getEntityById(
    ctx.config.DDB_MAIN_TABLE_NAME,
    `AUDIT_LOG#${id}`,
    ENTITY_TYPE.AUDIT_LOG,
  );

  assertLogItemVisible(item, listScope);

  return {
    statusCode: 200,
    data: {
      success: true,
      item: toAuditLogDetail(item),
    },
  };
};
