import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const BLOG_ROUTE_DEFS = Object.freeze({
  GET_ONE: {
    key: "GET:/blogs",
    access: ROUTE_ACCESS.PUBLIC,
  },
  LIST: {
    key: "POST:/blogs/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.BLOG.LIST,
  },
  RELATED: {
    key: "GET:/blogs/related",
    access: ROUTE_ACCESS.PUBLIC,
  },
  TOP_SEARCHED: {
    key: "GET:/blogs/top-searched",
    access: ROUTE_ACCESS.PUBLIC,
  },
  MANAGEMENT_GET_ONE: {
    key: "GET:/management/blogs",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG.READ),
  },
  MANAGEMENT_LIST: {
    key: "POST:/management/blogs/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG.READ),
    crudAction: CRUD_ACTIONS.BLOG.LIST,
  },
  CREATE: {
    key: "POST:/blogs",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG.CREATE),
    crudAction: CRUD_ACTIONS.BLOG.CREATE,
  },
  UPDATE: {
    key: "PUT:/blogs",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG.UPDATE),
    crudAction: CRUD_ACTIONS.BLOG.UPDATE,
  },
  DELETE: {
    key: "DELETE:/blogs",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG.DELETE),
    crudAction: CRUD_ACTIONS.BLOG.DELETE,
  },
  CATEGORY_GET_ONE: {
    key: "GET:/blogs/categories",
    access: ROUTE_ACCESS.PUBLIC,
  },
  CATEGORY_LIST: {
    key: "POST:/blogs/categories/list",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.BLOG_CATEGORY.LIST,
  },
  MANAGEMENT_CATEGORY_GET_ONE: {
    key: "GET:/management/blogs/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG_CATEGORY.READ),
  },
  MANAGEMENT_CATEGORY_LIST: {
    key: "POST:/management/blogs/categories/list",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG_CATEGORY.READ),
    crudAction: CRUD_ACTIONS.BLOG_CATEGORY.LIST,
  },
  CATEGORY_CREATE: {
    key: "POST:/blogs/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG_CATEGORY.CREATE),
    crudAction: CRUD_ACTIONS.BLOG_CATEGORY.CREATE,
  },
  CATEGORY_UPDATE: {
    key: "PUT:/blogs/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG_CATEGORY.UPDATE),
    crudAction: CRUD_ACTIONS.BLOG_CATEGORY.UPDATE,
  },
  CATEGORY_DELETE: {
    key: "DELETE:/blogs/categories",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.BLOG_CATEGORY.DELETE),
    crudAction: CRUD_ACTIONS.BLOG_CATEGORY.DELETE,
  },
});
