import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const NOTIFICATIONS_ROUTE_DEFS = Object.freeze({
  ACTIVE: {
    key: "GET:/notifications/announcements/active",
    access: ROUTE_ACCESS.PUBLIC,
    maintenanceAllow: true,
  },
  MANAGEMENT_GET_ONE: {
    key: "GET:/management/notifications/announcements",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.ANNOUNCEMENT.READ),
  },
  MANAGEMENT_LIST: {
    key: "POST:/management/notifications/announcements/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.ANNOUNCEMENT.READ),
    crudAction: CRUD_ACTIONS.ANNOUNCEMENT.LIST,
  },
  CREATE: {
    key: "POST:/notifications/announcements",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.ANNOUNCEMENT.CREATE),
    crudAction: CRUD_ACTIONS.ANNOUNCEMENT.CREATE,
  },
  UPDATE: {
    key: "PUT:/notifications/announcements",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.ANNOUNCEMENT.UPDATE),
    crudAction: CRUD_ACTIONS.ANNOUNCEMENT.UPDATE,
  },
  DELETE: {
    key: "DELETE:/notifications/announcements",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.ANNOUNCEMENT.DELETE),
    crudAction: CRUD_ACTIONS.ANNOUNCEMENT.DELETE,
  },
});
