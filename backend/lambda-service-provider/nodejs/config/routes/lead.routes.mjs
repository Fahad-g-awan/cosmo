import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const LEAD_ROUTE_DEFS = Object.freeze({
  GET_ONE: {
    key: "GET:/leads",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.LEAD.READ),
  },
  LIST: {
    key: "POST:/leads/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.LEAD.READ),
  },
  CREATE: {
    key: "POST:/leads",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.LEAD.CREATE,
  },
  UPDATE: {
    key: "PUT:/leads",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.LEAD.UPDATE),
    crudAction: CRUD_ACTIONS.LEAD.UPDATE,
  },
  UPDATE_STATUS: {
    key: "PUT:/leads/status",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.LEAD.UPDATE),
    crudAction: CRUD_ACTIONS.LEAD.STATUS_UPDATE,
  },
});
