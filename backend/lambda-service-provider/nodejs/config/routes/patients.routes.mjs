import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const PATIENTS_ROUTE_DEFS = Object.freeze({
  GET_ONE: {
    key: "GET:/patients",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PROFILE.READ, PERMISSIONS.PATIENT.READ),
  },
  LIST: {
    key: "POST:/patients/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PATIENT.READ),
    crudAction: CRUD_ACTIONS.PATIENT.LIST,
  },
  CREATE: {
    key: "POST:/patients",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PATIENT.CREATE),
    crudAction: CRUD_ACTIONS.PATIENT.CREATE,
  },
  UPDATE: {
    key: "PUT:/patients",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () =>
      anyOf(PERMISSIONS.PATIENT.UPDATE, PERMISSIONS.PROFILE.UPDATE),
    crudAction: CRUD_ACTIONS.PATIENT.UPDATE,
  },
  DELETE: {
    key: "DELETE:/patients",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PATIENT.DELETE),
    crudAction: CRUD_ACTIONS.PATIENT.DELETE,
  },
});
