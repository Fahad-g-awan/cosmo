import {
  SignUpCommand,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import {
  USER_STATUS,
  AUTH_STATUS,
} from "/opt/nodejs/constants/auth/status.constants.mjs";
import {
  rethrowOrInternal,
  httpError,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { calculateSecretHash } from "/opt/nodejs/lib/auth/crypto/cognito-secret-hash.utils.mjs";
import { getRoleDefaultGrants } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { cognitoGetUserByEmail } from "/opt/nodejs/lib/auth/cognito/admin-users.mjs";
import { getIdentityByEmail } from "/opt/nodejs/services/prisma/identity/read.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { cognitoIDP } from "/opt/nodejs/lib/auth/cognito-idp.client.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";

import { resolveUnconfirmedSignupCognitoUsername } from "../lib/cognito-verification.mjs";
import { provisionPatientIdentity } from "../lib/patient-provision.mjs";
import { logAuthRegister } from "../lib/auth-compliance.service.mjs";
import { findIdentityByEmail } from "../lib/identity.mjs";

const mapCognitoSignUpFailure = (error, email) => {
  const message = String(error?.message || "");
  const lower = message.toLowerCase();
  const code = String(error?.code || error?.name || "");

  if (
    code === "AccountBlockedException" ||
    lower.includes("user is blocked") ||
    lower.includes("accountblockedexception")
  ) {
    return httpError({
      error: API_ERRORS.USER_BLOCKED,
      details: [`User is blocked: ${email}`, "Please contact admin."],
    });
  }

  if (
    code === "AccountUnavailableException" ||
    lower.includes("account is unavailable") ||
    lower.includes("accountunavailableexception")
  ) {
    return httpError({
      error: API_ERRORS.ACCOUNT_UNAVAILABLE,
      details: ["This account is unavailable. Please contact support."],
    });
  }

  // Cognito wraps PreSignUp throws as UserLambdaValidationException.
  if (code === "UserLambdaValidationException" || lower.includes("presignup")) {
    if (lower.includes("blocked")) {
      return httpError({
        error: API_ERRORS.USER_BLOCKED,
        details: [`User is blocked: ${email}`, "Please contact admin."],
      });
    }
    if (lower.includes("unavailable")) {
      return httpError({
        error: API_ERRORS.ACCOUNT_UNAVAILABLE,
        details: ["This account is unavailable. Please contact support."],
      });
    }
  }

  return httpError({
    error: API_ERRORS.BAD_REQUEST,
    details: ["Something went wrong", message].filter(Boolean),
  });
};

export const signUp = async (ctx) => {
  try {
    const { config } = ctx;
    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.AUTH.SIGNUP,
      ctx.reqBody,
    );

    const {
      email: emailRaw = "",
      password = "",
      firstName = "",
      lastName = "",
      phone = "",
      age = "",
      country = "",
      state = "",
      city = "",
      completeAddress = "",
      postalCode = "",
    } = reqBody;

    const email = String(emailRaw).trim().toLowerCase();

    // Raw identity (includes soft-deleted) so we can gate before Cognito PreSignUp.
    const existingIdentity = await getIdentityByEmail(
      config.POSTGRES_DB_URL,
      email,
    );

    if (existingIdentity?.deleted) {
      throw httpError({
        error: API_ERRORS.ACCOUNT_UNAVAILABLE,
        details: ["This account is unavailable. Please contact support."],
      });
    }

    if (existingIdentity?.status === USER_STATUS.BLOCKED) {
      throw httpError({
        error: API_ERRORS.USER_BLOCKED,
        details: [`User is blocked: ${email}`, "Please contact admin."],
      });
    }

    const { user: foundUser } = await findIdentityByEmail(
      config.POSTGRES_DB_URL,
      email,
    );

    if (foundUser?.status === USER_STATUS.ACTIVE) {
      throw httpError({
        error: API_ERRORS.USER_EXISTS,
        details: [`User already exists: ${email}`, "Please signin"],
      });
    }

    try {
      const secretHash = calculateSecretHash(
        email,
        config.COGNITO_CLIENT_ID,
        config.COGNITO_CLIENT_SECRET,
      );
      const resp = await cognitoIDP.send(
        new SignUpCommand({
          ClientId: config.COGNITO_CLIENT_ID,
          Username: email,
          Password: password,
          SecretHash: secretHash,
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "preferred_username", Value: email },
          ],
        }),
      );

      if (!foundUser) {
        const createdIdentity = await provisionPatientIdentity(ctx, {
          cognitoSub: resp?.UserSub || "",
          email,
          identity: {
            phone: phone || null,
            status: USER_STATUS.UNCONFIRMED,
            perms: getRoleDefaultGrants(USER_ROLES.PATIENT),
            defaultPasswordUsed: false,
            passwordSet: true,
            linkedProviders: [],
          },
          profile: {
            firstName,
            lastName,
            age: Number(age) ? Number(age) : null,
            country: country || null,
            state: state || null,
            city: city || null,
            completeAddress: completeAddress || null,
            postalCode: postalCode || null,
          },
        });

        await logAuthRegister({
          tableName: config.DDB_MAIN_TABLE_NAME,
          databaseUrl: config.POSTGRES_DB_URL,
          identity: createdIdentity,
          logData: {
            method: "native",
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
          },
        });
      }

      return {
        statusCode: 200,
        data: {
          message: `Email verification code sent at ${email}`,
          status: AUTH_STATUS.CONF_CODE_SENT,
          requiresVerification: true,
          email,
          success: true,
        },
      };
    } catch (error) {
      if (
        error?.name === "UsernameExistsException" ||
        error?.code === "UsernameExistsException"
      ) {
        const userData = await cognitoGetUserByEmail(config, email);
        if (
          userData?.UserStatus?.toLowerCase() ===
          USER_STATUS.UNCONFIRMED.toLowerCase()
        ) {
          const cognitoUsername = foundUser
            ? await resolveUnconfirmedSignupCognitoUsername(config, foundUser)
            : email;
          const secretHash = calculateSecretHash(
            cognitoUsername,
            config.COGNITO_CLIENT_ID,
            config.COGNITO_CLIENT_SECRET,
          );
          await cognitoIDP.send(
            new ResendConfirmationCodeCommand({
              ClientId: config.COGNITO_CLIENT_ID,
              Username: cognitoUsername,
              SecretHash: secretHash,
            }),
          );
          return {
            statusCode: 200,
            data: {
              success: true,
              message: `Confirmation code resent at ${email}`,
              status: AUTH_STATUS.RESEND_CONF_CODE,
              requiresVerification: true,
              email,
            },
          };
        }
        throw httpError({
          error: API_ERRORS.USER_EXISTS,
          details: [
            `User already exists: ${email}`,
            error?.message || "Please signin",
          ],
        });
      }
      throw mapCognitoSignUpFailure(error, email);
    }
  } catch (error) {
    console.error("[auth] signup", error);
    rethrowOrInternal(error);
  }
};
