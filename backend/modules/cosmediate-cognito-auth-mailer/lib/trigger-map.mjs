import { EMAIL_TYPE } from "/opt/nodejs/lib/mailer/index.mjs";

/** @type {Record<string, string | null>} null = use resend-code resolver */
export const TRIGGER_TO_EMAIL_TYPE = Object.freeze({
  CustomMessage_AdminCreateUser: EMAIL_TYPE.AUTH_ADMIN_CREATE_USER,
  CustomMessage_SignUp: EMAIL_TYPE.AUTH_SIGN_UP,
  CustomMessage_ForgotPassword: EMAIL_TYPE.AUTH_FORGOT_PASSWORD,
  CustomMessage_ResendCode: null,
  CustomMessage_VerifyUserAttribute: EMAIL_TYPE.AUTH_VERIFY_USER_ATTRIBUTE,
  CustomMessage_UpdateUserAttribute: EMAIL_TYPE.AUTH_UPDATE_USER_ATTRIBUTE,
  CustomMessage_Authentication: EMAIL_TYPE.AUTH_AUTHENTICATION,
});

/**
 * @param {import("aws-lambda").CustomMessageTriggerEvent} event
 * @returns {string | null}
 */
export const resolveEmailTypeForTrigger = (event) => {
  const mapped = TRIGGER_TO_EMAIL_TYPE[event.triggerSource];

  if (mapped === null) {
    return resolveResendCodeEmailType(event);
  }

  return mapped ?? null;
};

/**
 * CustomMessage_ResendCode covers signup verification resend and forgot-password resend.
 *
 * @param {import("aws-lambda").CustomMessageTriggerEvent} event
 * @returns {string}
 */
const resolveResendCodeEmailType = (event) => {
  const status = event.request?.userAttributes?.["cognito:user_status"];

  if (status === "UNCONFIRMED") {
    return EMAIL_TYPE.AUTH_SIGN_UP_RESEND;
  }

  return EMAIL_TYPE.AUTH_FORGOT_PASSWORD_RESEND;
};
