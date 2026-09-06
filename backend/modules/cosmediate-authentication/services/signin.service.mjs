import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { nativeSignIn } from "./signin-native.service.mjs";
import { oauthSignIn } from "./signin-oauth.service.mjs";

export const signIn = async (ctx) => {
  const { value: reqBody } = await validateRequestBody(
    CRUD_ACTIONS.AUTH.SIGNIN,
    ctx.reqBody,
  );

  const {
    email = null,
    password = null,
    code = null,
    redirectUri = null,
  } = reqBody;

  if (!code && email && password) {
    return nativeSignIn(ctx, { email, password });
  }
  if (code && !email && !password) {
    return oauthSignIn(ctx, { code, redirectUri });
  }

  throw httpError({ error: API_ERRORS.BAD_REQUEST });
};
