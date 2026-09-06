import { AUTH_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/auth.routes.mjs";

import {
  oauthLinkStart,
  linkOAuthCallback,
} from "../controllers/oauth-link.mjs";
import {
  forgotPassword,
  resetPassword,
  setNewPassword,
  updatePassword,
} from "../controllers/password.mjs";
import {
  signupConfirmation,
  resendSignupCode,
} from "../controllers/verification.mjs";
import { getAuthMe, getAuthMeMethods } from "../controllers/me.mjs";
import { refreshTokens } from "../controllers/tokens.mjs";
import { handleLogout } from "../controllers/logout.mjs";
import { signIn } from "../controllers/signin.mjs";
import { signUp } from "../controllers/signup.mjs";

export const ROUTES = new Map([
  [R.SIGN_UP.key, signUp],
  [R.SIGN_IN.key, signIn],
  [R.LOGOUT.key, handleLogout],
  [R.CONFIRM_SIGNUP.key, signupConfirmation],
  [R.RESEND_SIGNUP_CODE.key, resendSignupCode],
  [R.UPDATE_PASSWORD.key, updatePassword],
  [R.SET_NEW_PASSWORD.key, setNewPassword],
  [R.FORGOT_PASSWORD.key, forgotPassword],
  [R.FORGOT_PASSWORD_RESEND.key, forgotPassword],
  [R.RESET_PASSWORD.key, resetPassword],
  [R.OAUTH_LINK_START.key, oauthLinkStart],
  [R.OAUTH_LINK_CALLBACK.key, linkOAuthCallback],
  [R.REFRESH_TOKENS.key, refreshTokens],
  [R.ME.key, getAuthMe],
  [R.ME_METHODS.key, getAuthMeMethods],
]);
