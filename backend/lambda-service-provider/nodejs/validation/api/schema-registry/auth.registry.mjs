import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import {
  AuthSignup,
  AuthSignin,
  AuthEmailVerification,
  AuthResendSignupCode,
  AuthUpdatePassword,
  AuthSetNewPassword,
  AuthForgotPassword,
  AuthResetPassword,
  AuthLogout,
  AuthOAuthLinkStart,
  AuthOAuthLinkCallback,
} from "../schemas/auth.mjs";

export const AUTH_SCHEMAS = {
  [CRUD_ACTIONS.AUTH.SIGNUP]: AuthSignup,
  [CRUD_ACTIONS.AUTH.SIGNIN]: AuthSignin,
  [CRUD_ACTIONS.AUTH.EMAIL_VERIFICATION]: AuthEmailVerification,
  [CRUD_ACTIONS.AUTH.RESEND_SIGNUP_CODE]: AuthResendSignupCode,
  [CRUD_ACTIONS.AUTH.UPDATE_PASSWORD]: AuthUpdatePassword,
  [CRUD_ACTIONS.AUTH.SET_NEW_PASSWORD]: AuthSetNewPassword,
  [CRUD_ACTIONS.AUTH.FORGOT_PASSWORD]: AuthForgotPassword,
  [CRUD_ACTIONS.AUTH.RESET_PASSWORD]: AuthResetPassword,
  [CRUD_ACTIONS.AUTH.LOGOUT]: AuthLogout,
  [CRUD_ACTIONS.AUTH.LINK_OAUTH_START]: AuthOAuthLinkStart,
  [CRUD_ACTIONS.AUTH.LINK_OAUTH_CALLBACK]: AuthOAuthLinkCallback,
};
