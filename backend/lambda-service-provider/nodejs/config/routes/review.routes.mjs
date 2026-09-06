import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const REVIEW_ROUTE_DEFS = Object.freeze({
  GET_ONE: {
    key: "GET:/reviews",
    access: ROUTE_ACCESS.PUBLIC,
  },
  LIST: {
    key: "POST:/reviews/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.REVIEW.LIST,
  },
  MANAGEMENT_GET_ONE: {
    key: "GET:/management/reviews",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW.READ),
  },
  MANAGEMENT_LIST: {
    key: "POST:/management/reviews/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW.READ),
    crudAction: CRUD_ACTIONS.REVIEW.LIST,
  },
  CREATE: {
    key: "POST:/reviews",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW.CREATE),
    crudAction: CRUD_ACTIONS.REVIEW.CREATE,
  },
  UPDATE: {
    key: "PUT:/reviews",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW.UPDATE),
    crudAction: CRUD_ACTIONS.REVIEW.UPDATE,
  },
  DELETE: {
    key: "DELETE:/reviews",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW.DELETE),
    crudAction: CRUD_ACTIONS.REVIEW.DELETE,
  },
  REPLY_GET_ONE: {
    key: "GET:/reviews/replies",
    access: ROUTE_ACCESS.PUBLIC,
  },
  REPLY_LIST: {
    key: "POST:/reviews/replies/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.REVIEW_REPLY.LIST,
  },
  MANAGEMENT_REPLY_GET_ONE: {
    key: "GET:/management/reviews/replies",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW_REPLY.READ),
  },
  MANAGEMENT_REPLY_LIST: {
    key: "POST:/management/reviews/replies/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW_REPLY.READ),
    crudAction: CRUD_ACTIONS.REVIEW_REPLY.LIST,
  },
  REPLY_CREATE: {
    key: "POST:/reviews/replies",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW_REPLY.CREATE),
    crudAction: CRUD_ACTIONS.REVIEW_REPLY.CREATE,
  },
  REPLY_UPDATE: {
    key: "PUT:/reviews/replies",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW_REPLY.UPDATE),
    crudAction: CRUD_ACTIONS.REVIEW_REPLY.UPDATE,
  },
  REPLY_DELETE: {
    key: "DELETE:/reviews/replies",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.REVIEW_REPLY.DELETE),
    crudAction: CRUD_ACTIONS.REVIEW_REPLY.DELETE,
  },
});
