import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  getActivityLogById,
  listActivityLogs,
} from "../services/activity-logs.service.mjs";

export const listActivityLogsHandler = async () => {
  try {
    return await listActivityLogs(getRequestContext());
  } catch (error) {
    console.error("[platform] activity-logs list", error);
    rethrowOrInternal(error);
  }
};

export const getActivityLogHandler = async () => {
  try {
    return await getActivityLogById(getRequestContext());
  } catch (error) {
    console.error("[platform] activity-logs get", error);
    rethrowOrInternal(error);
  }
};
