import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const LAMBDA_TEST_ROUTE_DEFS = Object.freeze({
  HEALTH: {
    key: "GET:/test/health",
    access: ROUTE_ACCESS.PUBLIC,
  },
  ENV: {
    key: "GET:/test/env",
    access: ROUTE_ACCESS.PUBLIC,
  },
  CLIENTS: {
    key: "GET:/test/clients",
    access: ROUTE_ACCESS.AUTH_ONLY,
  },
  AUTH_PROBE: {
    key: "GET:/test/auth-probe",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PLATFORM.CONSTANTS),
  },
  VALIDATE: {
    key: "POST:/test/validate",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.LAMBDA_TEST.VALIDATE,
  },
  ROUTE_ACCESS: {
    key: "POST:/test/route-access",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.LAMBDA_TEST.ROUTE_ACCESS,
  },
  GRANTS: {
    key: "POST:/test/grants",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PERMISSIONS.GRANT),
    crudAction: CRUD_ACTIONS.LAMBDA_TEST.GRANTS,
  },
  ROUTES: {
    key: "GET:/test/routes",
    access: ROUTE_ACCESS.PUBLIC,
  },
  UPLOAD: {
    key: "POST:/test/upload",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.IMAGE.UPLOAD),
  },
  ERRORS: {
    key: "POST:/test/errors",
    access: ROUTE_ACCESS.PUBLIC,
  },
});
