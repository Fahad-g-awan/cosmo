import { email, password, phone, verificationCode } from "../shared/fragments.schema.mjs";
import { String, Integer, URI } from "../shared/primitives.schema.mjs";

export const AuthSignup = {
  type: "object",
  additionalProperties: false,
  required: ["email", "password", "firstName", "lastName"],
  properties: {
    email,
    password,
    firstName: String,
    lastName: String,
    phone,
    age: Integer,
    country: String,
    state: String,
    city: String,
    completeAddress: String,
    postalCode: String,
  },
  errorMessage: {
    required: {
      email: "Email is required",
      password: "Password is required",
      firstName: "First name is required",
      lastName: "Last name is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      email: "Email must be a valid address",
      password: "Password must be at least 8 characters",
      firstName: "First name is required",
      lastName: "Last name is required",
    },
  },
};

export const AuthEmailVerification = {
  type: "object",
  additionalProperties: false,
  required: ["email", "code"],
  properties: {
    email,
    code: verificationCode,
    password,
  },
  errorMessage: {
    required: {
      email: "Email is required",
      code: "Verification code is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      email: "Email must be a valid address",
      code: "Verification code is required",
      password: "Password must be at least 8 characters",
    },
  },
};

const SigninMethod = {
  type: "string",
  enum: ["password", "code"],
};

export const AuthSignin = {
  type: "object",
  required: ["method"],
  properties: {
    method: SigninMethod,
  },
  allOf: [
    {
      if: {
        properties: { method: { const: "password" } },
      },
      then: {
        required: ["email", "password"],
        additionalProperties: false,
        properties: {
          method: SigninMethod,
          email,
          password,
        },
      },
    },
    {
      if: {
        properties: { method: { const: "code" } },
      },
      then: {
        required: ["code", "redirectUri"],
        additionalProperties: false,
        properties: {
          method: SigninMethod,
          code: String,
          redirectUri: URI,
        },
      },
    },
  ],
};

// export const AuthSigninPassword = {
//   type: "object",
//   additionalProperties: false,
//   required: ["email", "password"],
//   properties: {
//     email,
//     password,
//   },
//   errorMessage: {
//     required: {
//       email: "Email is required",
//       password: "Password is required",
//     },
//     additionalProperties: "Unknown field supplied",
//     properties: {
//       email: "Email must be a valid address",
//       password: "Password must be at least 8 characters",
//     },
//   },
// };

// export const AuthSigninCode = {
//   type: "object",
//   additionalProperties: false,
//   required: ["code", "redirectUri"],
//   properties: {
//     code: verificationCode,
//     redirectUri: URI,
//   },
//   errorMessage: {
//     required: {
//       code: "Auth code is required",
//       redirectUri: "Redirect URI is required",
//     },
//     additionalProperties: "Unknown field supplied",
//     properties: {
//       code: "Auth code is required",
//       redirectUri: "Redirect URI is required",
//     },
//   },
// };

// // oneOf variants for sign-in
// export const AuthSignin = {
//   type: "object",
//   oneOf: [AuthSigninPassword, AuthSigninCode],
//   errorMessage: {
//     oneOf: "Provide email+password OR code+redirectUri (but not both).",
//   },
// };

export const AuthUpdatePassword = {
  type: "object",
  additionalProperties: false,
  required: ["userId", "email", "oldPassword", "newPassword"],
  properties: {
    userId: String,
    email,
    oldPassword: password,
    newPassword: password,
  },
  errorMessage: {
    required: {
      userId: "User ID is required",
      email: "Email is required",
      oldPassword: "Old password is required",
      newPassword: "New password is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      userId: "User ID is required",
      email: "Email is required",
      oldPassword: "Old password is required",
      newPassword: "New password is required",
    },
  },
};

export const AuthSetNewPassword = {
  type: "object",
  additionalProperties: false,
  required: ["userId", "email", "password"],
  properties: {
    userId: String,
    email,
    password,
  },
  errorMessage: {
    required: {
      userId: "User ID is required",
      email: "Email is required",
      password: "Password is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      userId: "User ID is required",
      email: "Email is required",
      password: "Password is required",
    },
  },
};

export const AuthResendSignupCode = {
  type: "object",
  additionalProperties: false,
  required: ["email"],
  properties: {
    email,
  },
  errorMessage: {
    required: {
      email: "Email is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      email: "Email must be a valid address",
    },
  },
};

export const AuthForgotPassword = {
  type: "object",
  additionalProperties: false,
  required: ["email"],
  properties: {
    email,
  },
  errorMessage: {
    required: {
      email: "Email is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      email: "Email must be a valid address",
    },
  },
};

export const AuthResetPassword = {
  type: "object",
  additionalProperties: false,
  required: ["email", "code", "newPassword"],
  properties: {
    email,
    code: verificationCode,
    newPassword: password,
  },
  errorMessage: {
    required: {
      email: "Email is required",
      code: "Verification code is required",
      newPassword: "New password is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      email: "Email must be a valid address",
      code: "Verification code is required",
      newPassword: "New password is required",
    },
  },
};

export const AuthLogout = {
  type: "object",
  additionalProperties: false,
  required: ["redirectUri"],
  properties: {
    redirectUri: String,
  },
  errorMessage: {
    required: {
      redirectUri: "Redirect URI is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      redirectUri: "Redirect URI is required",
    },
  },
};

/** Hosted UI **`/oauth2/authorize`** URL building (logged-in Pattern 1). */
export const AuthOAuthLinkStart = {
  type: "object",
  additionalProperties: false,
  required: ["redirectUri"],
  properties: {
    redirectUri: URI,
    /** Cognito Hosted UI **`identity_provider`** (**`Google`**, **`Facebook`**, …). Optional. */
    identityProvider: String,
  },
  errorMessage: {
    required: {
      redirectUri: "Redirect URI is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      redirectUri: "Redirect URI is required",
    },
  },
};

/** Pattern 1: **`POST /auth/oauth/link/callback`** body (code exchange + link). */
export const AuthOAuthLinkCallback = {
  type: "object",
  additionalProperties: false,
  required: ["email", "userId", "code", "redirectUri"],
  properties: {
    email,
    userId: String,
    code: String,
    redirectUri: URI,
    /** Optional **`refresh_token`**. Callback returns **`sendResponse`**-shape tokens when **`refreshViaOauth`** succeeds. **/
    refreshToken: String,
    /** Hosted UI provider slug (**`google`**, **`facebook`**, …). Defaults to **`google`**. */
    identityProvider: String,
  },
  errorMessage: {
    required: {
      email: "Email is required",
      userId: "User ID is required",
      code: "Auth code is required",
      redirectUri: "Redirect URI is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      email: "Email is required",
      userId: "User ID is required",
      code: "Auth code is required",
      redirectUri: "Redirect URI is required",
      refreshToken: "Refresh token must be a string when provided",
    },
  },
};
