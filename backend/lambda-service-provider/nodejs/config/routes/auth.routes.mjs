import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { CRUD_ACTIONS } from "../../constants/api/crud-actions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const AUTH_ROUTE_DEFS = Object.freeze({
  SIGN_UP: {
    key: "POST:/auth/sign-up",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.AUTH.SIGNUP,
  },
  SIGN_IN: {
    key: "POST:/auth/sign-in",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.AUTH.SIGNIN,
    maintenanceAllow: true,
  },
  LOGOUT: {
    key: "POST:/auth/logout",
    access: ROUTE_ACCESS.AUTH_ONLY,
    crudAction: CRUD_ACTIONS.AUTH.LOGOUT,
  },
  CONFIRM_SIGNUP: {
    key: "POST:/auth/confirm-signup",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.AUTH.EMAIL_VERIFICATION,
  },
  RESEND_SIGNUP_CODE: {
    key: "POST:/auth/confirm-signup/resend",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.AUTH.RESEND_SIGNUP_CODE,
  },
  UPDATE_PASSWORD: {
    key: "POST:/auth/password/update",
    access: ROUTE_ACCESS.AUTH_ONLY,
    crudAction: CRUD_ACTIONS.AUTH.UPDATE_PASSWORD,
  },
  SET_NEW_PASSWORD: {
    key: "POST:/auth/password/set-new",
    access: ROUTE_ACCESS.AUTH_ONLY,
    crudAction: CRUD_ACTIONS.AUTH.SET_NEW_PASSWORD,
  },
  FORGOT_PASSWORD: {
    key: "POST:/auth/password/forgot",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.AUTH.FORGOT_PASSWORD,
  },
  FORGOT_PASSWORD_RESEND: {
    key: "POST:/auth/password/forgot/resend",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.AUTH.FORGOT_PASSWORD,
  },
  RESET_PASSWORD: {
    key: "POST:/auth/password/reset",
    access: ROUTE_ACCESS.PUBLIC,
    crudAction: CRUD_ACTIONS.AUTH.RESET_PASSWORD,
  },
  OAUTH_LINK_START: {
    key: "POST:/auth/oauth/link/start",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SECURITY.UPDATE),
    crudAction: CRUD_ACTIONS.AUTH.LINK_OAUTH_START,
  },
  OAUTH_LINK_CALLBACK: {
    key: "POST:/auth/oauth/link/callback",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.SECURITY.UPDATE),
    crudAction: CRUD_ACTIONS.AUTH.LINK_OAUTH_CALLBACK,
  },
  REFRESH_TOKENS: {
    key: "POST:/auth/tokens/refresh",
    access: ROUTE_ACCESS.PUBLIC,
    maintenanceAllow: true,
  },
  ME: {
    key: "GET:/auth/me",
    access: ROUTE_ACCESS.AUTH_ONLY,
    maintenanceAllow: true,
  },
  ME_METHODS: {
    key: "GET:/auth/me/methods",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.PROFILE.READ),
  },
  ME_NOTIFICATIONS: {
    key: "GET:/auth/me/notifications",
    access: ROUTE_ACCESS.AUTH_ONLY,
    maintenanceAllow: true,
  },
  ME_DISMISS: {
    key: "POST:/auth/me/notifications/dismiss",
    access: ROUTE_ACCESS.AUTH_ONLY,
    crudAction: CRUD_ACTIONS.ANNOUNCEMENT.DISMISS,
    maintenanceAllow: true,
  },
});
