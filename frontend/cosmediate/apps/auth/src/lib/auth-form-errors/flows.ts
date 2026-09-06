import type { AuthMessages } from "@cosmediate/i18n";

import type {
  AuthFormErrorResult,
  AuthFormErrorRule,
  AuthFormFlow,
} from "./types";
import { hasBackendError, includesAny } from "./matchers";

const defaultError = (
  auth: AuthMessages,
  title: string,
): AuthFormErrorResult => ({
  toast: { title, description: auth.errors.genericDescription },
  preferDetailsInToast: true,
});

/**
 * Code-first rules. Never match bare "email" — that hijacks unverified/blocked copy.
 */
export function createAuthFormErrorRules(
  auth: AuthMessages,
): Record<AuthFormFlow, AuthFormErrorRule[]> {
  const { errors: e } = auth;

  const unavailable = (field?: string): AuthFormErrorResult => ({
    ...(field
      ? { fieldErrors: { [field]: e.accountUnavailableTitle } }
      : {}),
    toast: {
      title: e.accountUnavailableTitle,
      description: e.accountUnavailableDescription,
    },
    preferDetailsInToast: true,
  });

  const blocked = (field?: string): AuthFormErrorResult => ({
    ...(field
      ? { fieldErrors: { [field]: e.accountBlockedTitle } }
      : {}),
    toast: {
      title: e.accountBlockedTitle,
      description: e.accountBlockedDescription,
    },
    preferDetailsInToast: true,
  });

  const unverified = (opts?: {
    field?: string;
    redirect?: string;
  }): AuthFormErrorResult => ({
    ...(opts?.field
      ? { fieldErrors: { [opts.field]: e.accountUnverifiedTitle } }
      : {}),
    toast: {
      title: e.accountUnverifiedTitle,
      description: e.accountUnverifiedDescription,
    },
    preferDetailsInToast: true,
    ...(opts?.redirect ? { redirect: opts.redirect } : {}),
  });

  const notFound = (field: string, title: string): AuthFormErrorResult => ({
    fieldErrors: { [field]: e.signin.accountNotFound },
    toast: { title, description: e.supportHint },
    preferDetailsInToast: true,
  });

  return {
    signin: [
      {
        when: hasBackendError("user_blocked"),
        result: blocked("email"),
      },
      {
        when: hasBackendError("account_unavailable"),
        result: unavailable("email"),
      },
      {
        when: hasBackendError("user_unconfirmed"),
        result: unverified({ field: "email", redirect: "/confirm-signup" }),
      },
      {
        when: hasBackendError("user_not_found"),
        result: notFound("email", e.signin.pleaseSignUp),
      },
      {
        when: includesAny("does not exists", "does not exist"),
        result: notFound("email", e.signin.pleaseSignUp),
      },
      {
        when: includesAny(
          "account not verified",
          "verify your account",
          "not confirmed",
        ),
        result: unverified({ field: "email", redirect: "/confirm-signup" }),
      },
      {
        when: includesAny("blocked"),
        result: blocked("email"),
      },
      {
        when: includesAny("incorrect username", "incorrect email or password"),
        result: {
          toast: {
            title: e.fallbacks.signin,
            description: e.signin.invalidCredentials,
          },
        },
      },
      {
        when: hasBackendError("invalid_grant"),
        result: {
          toast: {
            title: e.fallbacks.signin,
            description: e.signin.invalidCredentials,
          },
        },
      },
    ],

    signup: [
      {
        when: hasBackendError("user_blocked"),
        result: blocked("email"),
      },
      {
        when: hasBackendError("account_unavailable"),
        result: unavailable("email"),
      },
      {
        when: hasBackendError("user_exists"),
        result: {
          fieldErrors: { email: e.signup.emailExists },
          toast: {
            title: e.signup.pleaseSignIn,
            description: e.supportHint,
          },
        },
      },
      {
        when: includesAny(
          "account is unavailable",
          "this account is unavailable",
        ),
        result: unavailable("email"),
      },
      {
        when: includesAny("valid password", "password must contain"),
        result: {
          fieldErrors: { password: e.passwordPolicy },
          toast: {
            title: e.validationFailed,
            description: e.passwordPolicy,
          },
          preferDetailsInToast: true,
        },
      },
      {
        when: includesAny("firstname"),
        result: { fieldErrors: { firstName: e.signup.invalidFirstName } },
      },
      {
        when: includesAny("lastname"),
        result: { fieldErrors: { lastName: e.signup.invalidLastName } },
      },
      {
        when: includesAny("already exists", "email already in use"),
        result: {
          fieldErrors: { email: e.signup.emailExists },
          toast: {
            title: e.signup.pleaseSignIn,
            description: e.supportHint,
          },
        },
      },
      {
        when: includesAny("blocked"),
        result: blocked("email"),
      },
    ],

    "confirm-signup": [
      {
        when: hasBackendError(
          "invalid_verification_code",
          "verification_code_expired",
        ),
        result: {
          fieldErrors: { code: e.confirmSignup.invalidCode },
          toast: {
            title: e.confirmSignup.invalidCodeToast,
            description: e.confirmSignup.tryAgain,
          },
          preferDetailsInToast: true,
        },
      },
      {
        when: hasBackendError("user_not_found"),
        result: {
          fieldErrors: { code: e.confirmSignup.accountNotFound },
          toast: {
            title: e.confirmSignup.accountNotFoundToast,
            description: e.supportHint,
          },
        },
      },
      {
        when: hasBackendError("user_already_confirmed"),
        result: {
          fieldErrors: { code: e.confirmSignup.alreadyVerified },
          toast: {
            title: e.confirmSignup.pleaseSignIn,
            description: e.confirmSignup.alreadyVerifiedToast,
          },
          redirect: "/signin",
        },
      },
      {
        when: (ctx) =>
          ctx.error === "invalid_request" &&
          ctx.message === "SIGNUP_SESSION_REQUIRED",
        result: {
          fieldErrors: { code: e.confirmSignup.sessionExpired },
          toast: {
            title: e.confirmSignup.sessionExpiredToast,
            description: e.confirmSignup.sessionExpiredHint,
          },
          redirect: "/signup",
        },
      },
      {
        when: includesAny("does not exists", "does not exist"),
        result: {
          fieldErrors: { code: e.confirmSignup.accountNotFound },
          toast: {
            title: e.confirmSignup.accountNotFoundToast,
            description: e.supportHint,
          },
        },
      },
      {
        when: includesAny("already verified", "already confirmed"),
        result: {
          fieldErrors: { code: e.confirmSignup.alreadyVerified },
          toast: {
            title: e.confirmSignup.pleaseSignIn,
            description: e.confirmSignup.alreadyVerifiedToast,
          },
          redirect: "/signin",
        },
      },
      {
        when: includesAny("invalid", "expire", "digits only"),
        result: {
          fieldErrors: { code: e.confirmSignup.invalidCode },
          toast: {
            title: e.confirmSignup.invalidCodeToast,
            description: e.confirmSignup.tryAgain,
          },
          preferDetailsInToast: true,
        },
      },
    ],

    "forgot-password": [
      {
        when: hasBackendError("oauth_only_user"),
        result: {
          toast: {
            title: e.forgotPassword.processFailed,
            description: e.forgotPassword.oauthOnly,
          },
          preferDetailsInToast: true,
        },
      },
      {
        when: hasBackendError("user_blocked"),
        result: blocked(),
      },
      {
        when: hasBackendError("account_unavailable"),
        result: unavailable(),
      },
      {
        when: hasBackendError("user_unconfirmed"),
        result: unverified({ redirect: "/confirm-signup" }),
      },
      {
        when: hasBackendError("user_not_found"),
        result: notFound("email", e.forgotPassword.pleaseSignUp),
      },
      {
        when: includesAny("signed up using", "social account", "linked provider"),
        result: {
          toast: {
            title: e.forgotPassword.processFailed,
            description: e.forgotPassword.socialOnly,
          },
          preferDetailsInToast: true,
        },
      },
      {
        when: includesAny("does not exists", "does not exist"),
        result: notFound("email", e.forgotPassword.pleaseSignUp),
      },
      {
        when: includesAny(
          "account not verified",
          "verify your account",
          "not confirmed",
        ),
        result: unverified({ redirect: "/confirm-signup" }),
      },
      {
        when: includesAny("account is unavailable", "unavailable"),
        result: unavailable(),
      },
      {
        when: includesAny("blocked"),
        result: blocked(),
      },
    ],

    "reset-password": [
      {
        when: hasBackendError("user_not_found"),
        result: {
          toast: {
            title: e.resetPassword.accountNotFound,
            description: e.supportHint,
          },
          redirect: "/confirm-signup",
          preferDetailsInToast: true,
        },
      },
      {
        when: hasBackendError("user_unconfirmed"),
        result: unverified({ redirect: "/confirm-signup" }),
      },
      {
        when: hasBackendError("user_blocked"),
        result: blocked(),
      },
      {
        when: hasBackendError(
          "invalid_verification_code",
          "verification_code_expired",
        ),
        result: {
          fieldErrors: { code: e.resetPassword.invalidCode },
          toast: {
            title: e.resetPassword.invalidCodeToast,
            description: e.resetPassword.tryAgain,
          },
          preferDetailsInToast: true,
        },
      },
      {
        when: includesAny("does not exists", "does not exist"),
        result: {
          toast: {
            title: e.resetPassword.accountNotFound,
            description: e.supportHint,
          },
          redirect: "/confirm-signup",
        },
      },
      {
        when: includesAny(
          "verify your account",
          "account not verified",
          "not confirmed",
        ),
        result: unverified({ redirect: "/confirm-signup" }),
      },
      {
        when: includesAny("blocked"),
        result: blocked(),
      },
      {
        when: includesAny("enter a valid password", "password must contain"),
        result: {
          fieldErrors: { newPassword: e.resetPassword.invalidPassword },
          toast: {
            title: e.resetPassword.invalidPasswordToast,
            description: e.passwordPolicy,
          },
          preferDetailsInToast: true,
        },
      },
      {
        when: includesAny("invalid", "expire", "digits only"),
        result: {
          fieldErrors: { code: e.resetPassword.invalidCode },
          toast: {
            title: e.resetPassword.invalidCodeToast,
            description: e.resetPassword.tryAgain,
          },
          preferDetailsInToast: true,
        },
      },
    ],
  };
}

export function createAuthFormErrorFallback(
  auth: AuthMessages,
): Record<AuthFormFlow, AuthFormErrorResult> {
  const { errors: e } = auth;

  return {
    signin: defaultError(auth, e.fallbacks.signin),
    signup: defaultError(auth, e.fallbacks.signup),
    "confirm-signup": {
      fieldErrors: { code: e.fallbacks.confirmSignupField },
      toast: defaultError(auth, e.fallbacks.confirmSignup).toast,
      preferDetailsInToast: true,
    },
    "forgot-password": defaultError(auth, e.fallbacks.forgotPassword),
    "reset-password": defaultError(auth, e.fallbacks.resetPassword),
  };
}

export function getAuthFormErrorRules(
  flow: AuthFormFlow,
  auth: AuthMessages,
): AuthFormErrorRule[] {
  return createAuthFormErrorRules(auth)[flow];
}

export function getAuthFormErrorFallback(
  flow: AuthFormFlow,
  auth: AuthMessages,
): AuthFormErrorResult {
  return createAuthFormErrorFallback(auth)[flow];
}
