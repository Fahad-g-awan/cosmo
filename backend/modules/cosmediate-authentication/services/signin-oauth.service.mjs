import {
  oAuthLogin,
  refreshViaOauth,
  cognitoGetUserByAccessToken,
} from "/opt/nodejs/lib/auth/cognito/oauth.mjs";
import { getLinkedProviderSlugsForPoolUsername } from "/opt/nodejs/services/auth/cognito-linking.mjs";
import { getRoleDefaultGrants } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { generateSessionId } from "/opt/nodejs/lib/auth/crypto/session.utils.mjs";
import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  logAuthRegister,
  logAuthSignIn,
} from "../lib/auth-compliance.service.mjs";
import { updateIdentityLinkedProviders } from "../lib/identity-updates.mjs";
import { linkedProviderSlugArraysEqual } from "../lib/linked-providers.mjs";
import { provisionPatientIdentity } from "../lib/patient-provision.mjs";
import { findIdentityByEmail } from "../lib/identity.mjs";
import { sendResponse } from "../lib/signin-response.mjs";
import { storeSession } from "../lib/session.mjs";

/**
 * Hosted UI code exchange — new or returning OAuth user.
 */
export const oauthSignIn = async (context, { code, redirectUri }) => {
  const { config } = context;

  let authTokens = await oAuthLogin(config, code, redirectUri);
  console.log("OAuthLogin authTokens", authTokens);

  const cognitoOauthUser = await cognitoGetUserByAccessToken(
    config,
    authTokens.access_token,
  );
  console.log("OAuth Sign-In: Cognito user info:", {
    username: cognitoOauthUser.username,
    sub: cognitoOauthUser.sub,
    email: cognitoOauthUser.email,
  });

  let oauthLinkedSlugs = [];
  try {
    oauthLinkedSlugs = await getLinkedProviderSlugsForPoolUsername(
      config,
      cognitoOauthUser.username,
    );
  } catch (slugErr) {
    console.error("OAuth Sign-In: provider slug resolve error:", slugErr);
  }

  if (!oauthLinkedSlugs?.length) {
    throw httpError({
      error: API_ERRORS.OAUTH_PROVIDER_UNRESOLVED,
      details: [
        "Could not resolve OAuth identity from Cognito. Try again or use another sign-in method.",
      ],
    });
  }

  console.log("OAuth Sign-In: linkedProviders from Cognito identities:", {
    oauthLinkedSlugs,
    username: cognitoOauthUser.username,
  });

  let { user: dbUser } = await findIdentityByEmail(
    config.POSTGRES_DB_URL,
    cognitoOauthUser.email,
  );

  console.log("OAuth Sign-In: Database lookup result:", {
    email: cognitoOauthUser.email,
    ddbUserExists: !!dbUser,
    ddbCognitoSub: dbUser?.cognitoSub,
    cognitoSub: cognitoOauthUser.sub,
    subsMatch: dbUser?.cognitoSub === cognitoOauthUser.sub,
  });

  if (dbUser) {
    console.log(
      "OAuth Sign-In: User exists, reconciling linkedProviders from Cognito identities",
    );

    if (dbUser.status === USER_STATUS.BLOCKED) {
      throw httpError({
        error: API_ERRORS.USER_BLOCKED,
        details: [
          `User is blocked: ${cognitoOauthUser.email}`,
          "Please contact support.",
        ],
      });
    }

    if (dbUser.cognitoSub !== cognitoOauthUser.sub) {
      console.error(
        "OAuth Sign-In: blocked Identity.sub vs token sub mismatch",
        {
          identityCognitoSub: dbUser.cognitoSub,
          tokenSub: cognitoOauthUser.sub,
        },
      );
      throw httpError({
        error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
        details: [
          "Your social sign-in does not match this account's identity. Use the correct sign-in method or contact support.",
        ],
      });
    }

    if (
      !linkedProviderSlugArraysEqual(
        dbUser.linkedProviders || [],
        oauthLinkedSlugs,
      )
    ) {
      try {
        await updateIdentityLinkedProviders({
          userId: dbUser.id,
          linkedProviders: oauthLinkedSlugs,
        });
        dbUser = { ...dbUser, linkedProviders: oauthLinkedSlugs };
        console.log(
          "OAuth Sign-In: linkedProviders projection updated:",
          oauthLinkedSlugs,
        );
      } catch (error) {
        console.error(
          "OAuth Sign-In: linkedProviders reconcile failed:",
          error,
        );
        throw httpError({
          error: API_ERRORS.INTERNAL_ERROR,
          details: [
            "Unable to synchronize linked providers.",
            error?.message || "",
          ],
        });
      }
    }
  } else {
    console.log("OAuth Sign-In: No existing account, creating new user");

    try {
      let firstName;
      let lastName;

      if (cognitoOauthUser?.given_name && cognitoOauthUser.family_name) {
        firstName = cognitoOauthUser?.given_name ?? "";
        lastName = cognitoOauthUser?.family_name ?? "";
      } else if (cognitoOauthUser?.name) {
        firstName = cognitoOauthUser?.name.split(" ")[0] ?? "";
        lastName = cognitoOauthUser?.name.split(" ")[1] ?? "";
      } else {
        firstName = cognitoOauthUser?.email.split("@")[0] ?? "";
        lastName = "";
      }

      dbUser = await provisionPatientIdentity(context, {
        cognitoSub: cognitoOauthUser.sub ?? null,
        email: cognitoOauthUser.email ?? null,
        identity: {
          phone: null,
          status: USER_STATUS.ACTIVE,
          perms: getRoleDefaultGrants(USER_ROLES.PATIENT),
          defaultPasswordUsed: false,
          passwordSet: false,
          linkedProviders: oauthLinkedSlugs,
        },
        profile: {
          firstName,
          lastName,
          age: null,
          country: null,
          state: null,
          city: null,
          completeAddress: null,
          postalCode: null,
        },
      });

      await logAuthRegister({
        tableName: config.DDB_MAIN_TABLE_NAME,
        databaseUrl: config.POSTGRES_DB_URL,
        identity: dbUser,
        logData: {
          method: "oauth",
          provider: oauthLinkedSlugs[0] ?? null,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
        },
      });

      console.log("OAuth Sign-In: Refreshing tokens after user creation");
      try {
        const refreshedTokens = await refreshViaOauth(
          config,
          authTokens.refresh_token,
        );
        console.log("OAuth Sign-In: Tokens refreshed successfully");
        authTokens = {
          ...authTokens,
          access_token: refreshedTokens.access_token,
          id_token: refreshedTokens.id_token,
          expires_in: refreshedTokens.expires_in,
        };
      } catch (refreshError) {
        console.error(
          "OAuth Sign-In: Error refreshing tokens after user creation:",
          refreshError,
        );
      }
    } catch (error) {
      console.log("Error while creating user in DB:", error);
      throw httpError({
        error: API_ERRORS.INTERNAL_ERROR,
        details: [error?.message || ""],
      });
    }
  }

  const sessionId = generateSessionId();

  console.log("OAuth Sign-In: Storing session:", {
    identityId: dbUser.id,
    userCognitoSub: dbUser.cognitoSub,
    cognitoSub: cognitoOauthUser.sub,
    sessionId,
    linkedProviders: dbUser.linkedProviders,
    isLinked: dbUser.linkedProviders?.length > 1,
  });

  await storeSession({
    PK: `IDP_SESSION#USER#${dbUser.id}`,
    SK: "METADATA",
    tableName: config.DDB_AUTH_TABLE_NAME,
    accessToken: authTokens.access_token,
    refreshToken: authTokens.refresh_token,
    idToken: authTokens.id_token,
    expiresIn: authTokens.expires_in,
    sessionId,
    user: dbUser,
    tokenRefreshMode: "oauth",
  });

  await logAuthSignIn({
    tableName: config.DDB_MAIN_TABLE_NAME,
    databaseUrl: config.POSTGRES_DB_URL,
    identity: dbUser,
    logData: { method: "oauth", provider: oauthLinkedSlugs[0] ?? null },
  });

  console.log("OAuth Sign-In: Success", {
    userId: dbUser.id,
    email: dbUser.email,
    linkedProviders: dbUser.linkedProviders,
    sessionId,
  });

  return sendResponse({
    accessToken: authTokens.access_token,
    sessionId,
    idToken: authTokens.id_token,
    expiresIn: authTokens.expires_in,
    user: dbUser,
  });
};
