import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  getAuditLogById,
  listAuditLogs,
} from "../services/audit-logs.service.mjs";

export const listAuditLogsHandler = async () => {
  try {
    return await listAuditLogs(getRequestContext());
  } catch (error) {
    console.error("[platform] audit-logs list", error);
    rethrowOrInternal(error);
  }
};

export const getAuditLogHandler = async () => {
  try {
    return await getAuditLogById(getRequestContext());
  } catch (error) {
    console.error("[platform] audit-logs get", error);
    rethrowOrInternal(error);
  }
};
