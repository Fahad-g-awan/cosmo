import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const PLATFORM_ROUTE_DEFS = Object.freeze({
  CONSTANTS: {
    key: "GET:/platform/constants",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PLATFORM.CONSTANTS),
  },
  NAVIGATION: {
    key: "GET:/platform/navigation",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PLATFORM.NAVIGATION),
  },
  PERMISSIONS_CATALOG: {
    key: "GET:/platform/permissions/catalog",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PERMISSIONS.GRANT),
  },
  AUDIT_LOGS_LIST: {
    key: "POST:/platform/audit-logs/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PLATFORM.LOGS),
    crudAction: CRUD_ACTIONS.PLATFORM.AUDIT_LOGS_LIST,
  },
  AUDIT_LOGS_GET: {
    key: "GET:/platform/audit-logs",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PLATFORM.LOGS),
  },
  ACTIVITY_LOGS_LIST: {
    key: "POST:/platform/activity-logs/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PLATFORM.LOGS),
    crudAction: CRUD_ACTIONS.PLATFORM.ACTIVITY_LOGS_LIST,
  },
  ACTIVITY_LOGS_GET: {
    key: "GET:/platform/activity-logs",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PLATFORM.LOGS),
  },
  SYSTEM_SETTINGS_GET: {
    key: "GET:/platform/system-settings",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SYSTEM_SETTING.READ),
    maintenanceAllow: true,
  },
  SYSTEM_SETTINGS_UPDATE: {
    key: "PUT:/platform/system-settings",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SYSTEM_SETTING.UPDATE),
    crudAction: CRUD_ACTIONS.PLATFORM.SYSTEM_SETTINGS_UPDATE,
    maintenanceAllow: true,
  },
  SYSTEM_SETTINGS_PUBLIC: {
    key: "GET:/platform/system-settings/public",
    access: ROUTE_ACCESS.PUBLIC,
    maintenanceAllow: true,
  },
});
