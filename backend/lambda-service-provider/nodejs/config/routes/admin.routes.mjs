import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const ADMIN_ROUTE_DEFS = Object.freeze({
  BOOTSTRAP: {
    key: "POST:/admins/bootstrap",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.ADMIN.BOOTSTRAP,
  },
  GET_ONE: {
    key: "GET:/admins",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PROFILE.READ, PERMISSIONS.ADMIN.READ),
  },
  LIST: {
    key: "POST:/admins/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.ADMIN.READ),
    crudAction: CRUD_ACTIONS.ADMIN.LIST,
  },
  CREATE: {
    key: "POST:/admins",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.ADMIN.CREATE),
    crudAction: CRUD_ACTIONS.ADMIN.CREATE,
  },
  UPDATE: {
    key: "PUT:/admins",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.ADMIN.UPDATE, PERMISSIONS.PROFILE.UPDATE),
    crudAction: CRUD_ACTIONS.ADMIN.UPDATE,
  },
  DELETE: {
    key: "DELETE:/admins",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.ADMIN.DELETE),
    crudAction: CRUD_ACTIONS.ADMIN.DELETE,
  },
});
