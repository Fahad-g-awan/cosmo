import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";

export const OAUTH_ROUTE_DEFS = Object.freeze({
  GET_ONE: {
    key: "GET:/oauth/client-apps",
    access: ROUTE_ACCESS.AUTH_ONLY,
  },
  LIST: {
    key: "POST:/oauth/client-apps/list",
    access: ROUTE_ACCESS.AUTH_ONLY,
  },
  CREATE: {
    key: "POST:/oauth/client-apps",
    access: ROUTE_ACCESS.AUTH_ONLY,
    crudAction: CRUD_ACTIONS.OAUTH_CLIENT_APP.CREATE,
  },
  UPDATE: {
    key: "PUT:/oauth/client-apps",
    access: ROUTE_ACCESS.AUTH_ONLY,
    crudAction: CRUD_ACTIONS.OAUTH_CLIENT_APP.UPDATE,
  },
  DELETE: {
    key: "DELETE:/oauth/client-apps",
    access: ROUTE_ACCESS.AUTH_ONLY,
    crudAction: CRUD_ACTIONS.OAUTH_CLIENT_APP.DELETE,
  },
});
