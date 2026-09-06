import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const TREATMENT_ROUTE_DEFS = Object.freeze({
  CATEGORY_GET_ONE: {
    key: "GET:/treatments/categories",
    access: ROUTE_ACCESS.PUBLIC,
  },
  CATEGORY_LIST: {
    key: "POST:/treatments/categories/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.TREATMENT_CATEGORY.LIST,
  },
  MANAGEMENT_CATEGORY_GET_ONE: {
    key: "GET:/management/treatments/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_CATEGORY.READ),
  },
  MANAGEMENT_CATEGORY_LIST: {
    key: "POST:/management/treatments/categories/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_CATEGORY.READ),
    crudAction: CRUD_ACTIONS.TREATMENT_CATEGORY.LIST,
  },
  CATEGORY_CREATE: {
    key: "POST:/treatments/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_CATEGORY.CREATE),
    crudAction: CRUD_ACTIONS.TREATMENT_CATEGORY.CREATE,
  },
  CATEGORY_UPDATE: {
    key: "PUT:/treatments/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_CATEGORY.UPDATE),
    crudAction: CRUD_ACTIONS.TREATMENT_CATEGORY.UPDATE,
  },
  CATEGORY_DELETE: {
    key: "DELETE:/treatments/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_CATEGORY.DELETE),
    crudAction: CRUD_ACTIONS.TREATMENT_CATEGORY.DELETE,
  },
  GET_ONE: {
    key: "GET:/treatments",
    access: ROUTE_ACCESS.PUBLIC,
  },
  LIST: {
    key: "POST:/treatments/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.TREATMENT.LIST,
  },
  TOP_SEARCHED: {
    key: "GET:/treatments/top-searched",
    access: ROUTE_ACCESS.PUBLIC,
  },
  MANAGEMENT_GET_ONE: {
    key: "GET:/management/treatments",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT.READ),
  },
  MANAGEMENT_LIST: {
    key: "POST:/management/treatments/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT.READ),
    crudAction: CRUD_ACTIONS.TREATMENT.LIST,
  },
  CREATE: {
    key: "POST:/treatments",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT.CREATE),
    crudAction: CRUD_ACTIONS.TREATMENT.CREATE,
  },
  UPDATE: {
    key: "PUT:/treatments",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT.UPDATE),
    crudAction: CRUD_ACTIONS.TREATMENT.UPDATE,
  },
  DELETE: {
    key: "DELETE:/treatments",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT.DELETE),
    crudAction: CRUD_ACTIONS.TREATMENT.DELETE,
  },
  CLINIC_TREATMENT_SYNC: {
    key: "PUT:/treatments/clinic-treatments/sync",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT.SELECTION),
    crudAction: CRUD_ACTIONS.TREATMENT.CLINIC_TREATMENT_SYNC,
  },
  CLINIC_TREATMENT_LIST: {
    key: "POST:/treatments/clinic-treatments/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT.SELECTION),
    crudAction: CRUD_ACTIONS.TREATMENT.CLINIC_TREATMENT_LIST,
  },
  CLINIC_SUB_TREATMENT_SYNC: {
    key: "PUT:/treatments/clinic-treatments/sub-treatments/sync",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SUB_TREATMENT.UPSERT),
    crudAction: CRUD_ACTIONS.SUB_TREATMENT.CLINIC_SYNC,
  },
  CLINIC_ASSIGNMENT_SYNC: {
    key: "PUT:/treatments/clinic-treatments/assignments/sync",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT.SELECTION),
    crudAction: CRUD_ACTIONS.TREATMENT.CLINIC_ASSIGNMENT_SYNC,
  },
  CLINIC_SPECIALIST_TREATMENT_LIST: {
    key: "POST:/treatments/clinic-specialist-treatments/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.TREATMENT.CLINIC_SPECIALIST_TREATMENT_LIST,
  },
  MANAGEMENT_CLINIC_SPECIALIST_TREATMENT_LIST: {
    key: "POST:/management/treatments/clinic-specialist-treatments/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT.READ),
    crudAction: CRUD_ACTIONS.TREATMENT.CLINIC_SPECIALIST_TREATMENT_LIST,
  },
  SUB_GET_ONE: {
    key: "GET:/treatments/sub-treatments",
    access: ROUTE_ACCESS.PUBLIC,
  },
  SUB_LIST: {
    key: "POST:/treatments/sub-treatments/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.SUB_TREATMENT.LIST,
  },
  SUB_FILTERS: {
    key: "GET:/treatments/sub-treatments/filters-data",
    access: ROUTE_ACCESS.PUBLIC,
  },
  MANAGEMENT_SUB_GET_ONE: {
    key: "GET:/management/treatments/sub-treatments",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SUB_TREATMENT.READ),
  },
  MANAGEMENT_SUB_LIST: {
    key: "POST:/management/treatments/sub-treatments/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SUB_TREATMENT.READ),
    crudAction: CRUD_ACTIONS.SUB_TREATMENT.LIST,
  },
  RESULT_GET_ONE: {
    key: "GET:/treatments/results",
    access: ROUTE_ACCESS.PUBLIC,
  },
  RESULT_LIST: {
    key: "POST:/treatments/results/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.TREATMENT_RESULT.LIST,
  },
  MANAGEMENT_RESULT_GET_ONE: {
    key: "GET:/management/treatments/results",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_RESULT.READ),
  },
  MANAGEMENT_RESULT_LIST: {
    key: "POST:/management/treatments/results/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_RESULT.READ),
    crudAction: CRUD_ACTIONS.TREATMENT_RESULT.LIST,
  },
  RESULT_CREATE: {
    key: "POST:/treatments/results",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_RESULT.CREATE),
    crudAction: CRUD_ACTIONS.TREATMENT_RESULT.CREATE,
  },
  RESULT_UPDATE: {
    key: "PUT:/treatments/results",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_RESULT.UPDATE),
    crudAction: CRUD_ACTIONS.TREATMENT_RESULT.UPDATE,
  },
  RESULT_DELETE: {
    key: "DELETE:/treatments/results",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_RESULT.DELETE),
    crudAction: CRUD_ACTIONS.TREATMENT_RESULT.DELETE,
  },
  BRAND_GET_ONE: {
    key: "GET:/treatments/brands",
    access: ROUTE_ACCESS.PUBLIC,
  },
  BRAND_LIST: {
    key: "POST:/treatments/brands/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.TREATMENT_BRAND.LIST,
  },
  MANAGEMENT_BRAND_GET_ONE: {
    key: "GET:/management/treatments/brands",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_BRAND.READ),
  },
  MANAGEMENT_BRAND_LIST: {
    key: "POST:/management/treatments/brands/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_BRAND.READ),
    crudAction: CRUD_ACTIONS.TREATMENT_BRAND.LIST,
  },
  BRAND_CREATE: {
    key: "POST:/treatments/brands",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_BRAND.CREATE),
    crudAction: CRUD_ACTIONS.TREATMENT_BRAND.CREATE,
  },
  BRAND_UPDATE: {
    key: "PUT:/treatments/brands",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_BRAND.UPDATE),
    crudAction: CRUD_ACTIONS.TREATMENT_BRAND.UPDATE,
  },
  BRAND_DELETE: {
    key: "DELETE:/treatments/brands",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.TREATMENT_BRAND.DELETE),
    crudAction: CRUD_ACTIONS.TREATMENT_BRAND.DELETE,
  },
});
