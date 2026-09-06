import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const SPECIALISTS_ROUTE_DEFS = Object.freeze({
  GET_ONE: {
    key: "GET:/specialists",
    access: ROUTE_ACCESS.PUBLIC,
  },
  LIST: {
    key: "POST:/specialists/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.SPECIALIST.LIST,
  },
  TOP_SEARCHED: {
    key: "GET:/specialists/top-searched",
    access: ROUTE_ACCESS.PUBLIC,
  },
  BY_TREATMENT: {
    key: "POST:/specialists/by-treatment/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.SPECIALIST.GET_BY_TREATMENT,
  },
  MANAGEMENT_GET_ONE: {
    key: "GET:/management/specialists",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SPECIALIST.READ, PERMISSIONS.PROFILE.READ),
  },
  MANAGEMENT_LIST: {
    key: "POST:/management/specialists/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SPECIALIST.READ),
    crudAction: CRUD_ACTIONS.SPECIALIST.LIST,
  },
  MANAGEMENT_TOP_SEARCHED: {
    key: "GET:/management/specialists/top-searched",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SPECIALIST.READ),
  },
  MANAGEMENT_BY_TREATMENT: {
    key: "POST:/management/specialists/by-treatment/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SPECIALIST.READ),
    crudAction: CRUD_ACTIONS.SPECIALIST.GET_BY_TREATMENT,
  },
  CREATE: {
    key: "POST:/specialists",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SPECIALIST.CREATE),
    crudAction: CRUD_ACTIONS.SPECIALIST.CREATE,
  },
  UPDATE: {
    key: "PUT:/specialists",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () =>
      anyOf(PERMISSIONS.SPECIALIST.UPDATE, PERMISSIONS.PROFILE.UPDATE),
    crudAction: CRUD_ACTIONS.SPECIALIST.UPDATE,
  },
  DELETE: {
    key: "DELETE:/specialists",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SPECIALIST.DELETE),
    crudAction: CRUD_ACTIONS.SPECIALIST.DELETE,
  },
});
