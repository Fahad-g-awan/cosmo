import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const CLINIC_ROUTE_DEFS = Object.freeze({
  CATEGORY_GET_ONE: {
    key: "GET:/clinics/categories",
    access: ROUTE_ACCESS.PUBLIC,
  },
  CATEGORY_LIST: {
    key: "POST:/clinics/categories/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.CLINIC_CATEGORY.LIST,
  },
  MANAGEMENT_CATEGORY_GET_ONE: {
    key: "GET:/management/clinics/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC_CATEGORY.READ),
  },
  MANAGEMENT_CATEGORY_LIST: {
    key: "POST:/management/clinics/categories/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC_CATEGORY.READ),
    crudAction: CRUD_ACTIONS.CLINIC_CATEGORY.LIST,
  },
  CATEGORY_CREATE: {
    key: "POST:/clinics/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC_CATEGORY.CREATE),
    crudAction: CRUD_ACTIONS.CLINIC_CATEGORY.CREATE,
  },
  CATEGORY_UPDATE: {
    key: "PUT:/clinics/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC_CATEGORY.UPDATE),
    crudAction: CRUD_ACTIONS.CLINIC_CATEGORY.UPDATE,
  },
  CATEGORY_DELETE: {
    key: "DELETE:/clinics/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC_CATEGORY.DELETE),
    crudAction: CRUD_ACTIONS.CLINIC_CATEGORY.DELETE,
  },
  MANAGER_GET_ONE: {
    key: "GET:/clinics/managers",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () =>
      anyOf(PERMISSIONS.CLINIC_MANAGER.READ, PERMISSIONS.PROFILE.READ),
  },
  MANAGER_LIST: {
    key: "POST:/clinics/managers/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC_MANAGER.READ),
    crudAction: CRUD_ACTIONS.CLINIC_MANAGER.LIST,
  },
  MANAGER_CREATE: {
    key: "POST:/clinics/managers",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC_MANAGER.CREATE),
    crudAction: CRUD_ACTIONS.CLINIC_MANAGER.CREATE,
  },
  MANAGER_UPDATE: {
    key: "PUT:/clinics/managers",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () =>
      anyOf(PERMISSIONS.CLINIC_MANAGER.UPDATE, PERMISSIONS.PROFILE.UPDATE),
    crudAction: CRUD_ACTIONS.CLINIC_MANAGER.UPDATE,
  },
  MANAGER_DELETE: {
    key: "DELETE:/clinics/managers",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC_MANAGER.DELETE),
    crudAction: CRUD_ACTIONS.CLINIC_MANAGER.DELETE,
  },
  GET_ONE: {
    key: "GET:/clinics",
    access: ROUTE_ACCESS.PUBLIC,
  },
  LIST: {
    key: "POST:/clinics/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.CLINIC.LIST,
  },
  POPULAR: {
    key: "GET:/clinics/popular",
    access: ROUTE_ACCESS.PUBLIC,
  },
  TOP_SEARCHED: {
    key: "GET:/clinics/top-searched",
    access: ROUTE_ACCESS.PUBLIC,
  },
  BY_TREATMENT: {
    key: "POST:/clinics/by-treatment/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.CLINIC.GET_BY_TREATMENT,
  },
  MANAGEMENT_GET_ONE: {
    key: "GET:/management/clinics",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC.READ),
  },
  MANAGEMENT_LIST: {
    key: "POST:/management/clinics/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC.READ),
    crudAction: CRUD_ACTIONS.CLINIC.LIST,
  },
  MANAGEMENT_POPULAR: {
    key: "GET:/management/clinics/popular",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC.READ),
  },
  MANAGEMENT_BY_TREATMENT: {
    key: "POST:/management/clinics/by-treatment/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC.READ),
    crudAction: CRUD_ACTIONS.CLINIC.GET_BY_TREATMENT,
  },
  CREATE: {
    key: "POST:/clinics",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC.CREATE),
    crudAction: CRUD_ACTIONS.CLINIC.CREATE,
  },
  UPDATE: {
    key: "PUT:/clinics",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC.UPDATE),
    crudAction: CRUD_ACTIONS.CLINIC.UPDATE,
  },
  DELETE: {
    key: "DELETE:/clinics",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.CLINIC.DELETE),
    crudAction: CRUD_ACTIONS.CLINIC.DELETE,
  },
});
