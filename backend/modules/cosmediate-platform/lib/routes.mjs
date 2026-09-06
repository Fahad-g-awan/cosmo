import { PLATFORM_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/platform.routes.mjs";

import { getNavigationHandler } from "../controllers/navigation.mjs";
import { getPermissionsCatalogHandler } from "../controllers/permissions-catalog.mjs";
import { getRegistryHandler } from "../controllers/registry.mjs";
import {
  getAuditLogHandler,
  listAuditLogsHandler,
} from "../controllers/audit-logs.mjs";
import {
  getActivityLogHandler,
  listActivityLogsHandler,
} from "../controllers/activity-logs.mjs";
import {
  getPublicSystemSettingsHandler,
  getSystemSettingsHandler,
  updateSystemSettingsHandler,
} from "../controllers/system-settings.mjs";

export const ROUTES = new Map([
  [R.CONSTANTS.key, getRegistryHandler],
  [R.NAVIGATION.key, getNavigationHandler],
  [R.PERMISSIONS_CATALOG.key, getPermissionsCatalogHandler],
  [R.AUDIT_LOGS_LIST.key, listAuditLogsHandler],
  [R.AUDIT_LOGS_GET.key, getAuditLogHandler],
  [R.ACTIVITY_LOGS_LIST.key, listActivityLogsHandler],
  [R.ACTIVITY_LOGS_GET.key, getActivityLogHandler],
  [R.SYSTEM_SETTINGS_GET.key, getSystemSettingsHandler],
  [R.SYSTEM_SETTINGS_UPDATE.key, updateSystemSettingsHandler],
  [R.SYSTEM_SETTINGS_PUBLIC.key, getPublicSystemSettingsHandler],
]);
