import {
  oAuthLogin,
  refreshViaOauth,
  cognitoGetUserByAccessToken,
} from "/opt/nodejs/lib/auth/cognito/oauth.mjs";
import {
  resolveCognitoUsernameByEmailAndSub,
  getLinkedProviderSlugsForPoolUsername,
  resolveFederatedLinkSource,
  findFederatedSourceUserByEmail,
  cognitoTryLinkProviderToNative,
} from "/opt/nodejs/services/auth/cognito-linking.mjs";
import { cognitoProviderDisplayNameToLinkedSlug } from "/opt/nodejs/lib/auth/cognito/provider.utils.mjs";
import {
  rethrowOrInternal,
  httpError,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { requireSessionAuthContext } from "/opt/nodejs/lib/auth/authorization/session-auth.mjs";
import { generateSessionId } from "/opt/nodejs/lib/auth/crypto/session.utils.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { cognitoIDP } from "/opt/nodejs/lib/auth/cognito-idp.client.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";

import { sendSocialAccountLinkedEmail } from "../lib/transactional-emails.mjs";
import { updateIdentityLinkedProviders } from "../lib/identity-updates.mjs";
import { assertSessionMatchesIdentity } from "../lib/password-guards.mjs";
import { findIdentityByEmail } from "../lib/identity.mjs";
import { sendResponse } from "../lib/signin-response.mjs";
import { storeSession } from "../lib/session.mjs";

const requireOAuthLinkContext = (ctx) => {
  const { authToken, authContext } = ctx;

  if (!authToken || !authContext?.email) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["User is not authorized to perform this action."],
    });
  }

  return requireSessionAuthContext(authContext);
};

/** Pattern 1 — logged-in user links Google/etc via Hosted UI authorize URL. */
export const oauthLinkStart = async (ctx) => {
  try {
    const { config } = ctx;
    requireOAuthLinkContext(ctx);

    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.AUTH.LINK_OAUTH_START,
      ctx.reqBody,
    );
    const { redirectUri, identityProvider = null } = reqBody;

    const domain = String(config.COGNITO_DOMAIN || "").replace(/\/$/, "");
    if (!domain || !config.COGNITO_CLIENT_ID) {
      throw httpError({
        error: API_ERRORS.INTERNAL_ERROR,
        details: ["Cognito Hosted UI domain or client id is not configured."],
      });
    }

    const authorizeEndpoint = `${domain}/oauth2/authorize`;
    const u = new URL(authorizeEndpoint);

    u.searchParams.set("client_id", config.COGNITO_CLIENT_ID);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("scope", "openid email profile");
    u.searchParams.set("redirect_uri", redirectUri);
    u.searchParams.set("prompt", "select_account");
    const idp = identityProvider ? String(identityProvider).trim() : "";
    if (idp) u.searchParams.set("identity_provider", idp);

    return {
      statusCode: 200,
      data: {
        success: true,
        authorizeUrl: u.toString(),
      },
    };
  } catch (error) {
    console.error("Error at oauthLinkStart:", error);
    rethrowOrInternal(error);
  }
};

/**
 * Pattern 1 callback: native **`Bearer`**, Hosted UI **`code`**, **`AdminLinkProviderForUser`**,
 * then Postgres **`linkedProviders`** from Cognito only.
 */
export const linkOAuthCallback = async (ctx) => {
  try {
    const { config, authContext } = ctx;
    const { cognitoSub, identityId } = requireOAuthLinkContext(ctx);

    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.AUTH.LINK_OAUTH_CALLBACK,
      ctx.reqBody,
    );
    const {
      userId,
      email,
      code,
      redirectUri,
      refreshToken: nativeRefreshRaw = null,
      identityProvider: identityProviderRaw = null,
    } = reqBody;

    const expectedProviderSlug = identityProviderRaw
      ? String(identityProviderRaw).trim().toLowerCase()
      : "google";

    const nativeRefreshToken =
      typeof nativeRefreshRaw === "string" && nativeRefreshRaw.trim()
        ? nativeRefreshRaw.trim()
        : null;

    const norm = (s) =>
      String(s ?? "")
        .trim()
        .toLowerCase();

    if (norm(email) !== norm(authContext.email)) {
      throw httpError({
        error: API_ERRORS.EMAIL_MISMATCH,
        details: ["Request email does not match the signed-in account."],
      });
    }

    if (identityId !== userId) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["userId does not match the authenticated session."],
      });
    }

    const { user: identity } = await findIdentityByEmail(
      config.POSTGRES_DB_URL,
      email,
    );
    if (!identity) {
      throw httpError({
        error: API_ERRORS.USER_NOT_FOUND,
        details: [`User does not exists: ${email}`, "Please signup first"],
      });
    }

    if (identity.id !== userId) {
      throw httpError({
        error: API_ERRORS.USER_NOT_FOUND,
        details: ["userId does not match email Identity."],
      });
    }

    assertSessionMatchesIdentity({ cognitoSub, identityId }, identity);

    const cognitoResolved = await resolveCognitoUsernameByEmailAndSub(
      config,
      identity.email,
      identity.cognitoSub,
    );
    if (!cognitoResolved.ok) {
      if (cognitoResolved.reason === "ambiguous") {
        throw httpError({
          error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
          details: [
            "Multiple Cognito users match this email. Contact support to fix account linkage.",
          ],
        });
      }
      throw httpError({
        error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
        details: [
          "No native Cognito user matches your account. Complete signup or OAuth→password pivot first.",
        ],
      });
    }

    console.log("linkOAuthCallback: exchanging code + linking for", {
      email: identity.email,
      cognitoUsername: cognitoResolved.username,
    });

    const authTokens = await oAuthLogin(config, code, redirectUri);

    const oauthUser = await cognitoGetUserByAccessToken(
      config,
      authTokens.access_token,
    );

    const oauthTiEmail = norm(oauthUser.email);
    if (oauthTiEmail && oauthTiEmail !== norm(identity.email)) {
      throw httpError({
        error: API_ERRORS.EMAIL_MISMATCH,
        details: [
          "Social login email does not match your account email.",
          `Your account: ${identity.email}`,
          `Social login: ${oauthUser.email ?? "(unknown)"}`,
        ],
      });
    }

    let oauthAdminOut;
    try {
      oauthAdminOut = await cognitoIDP.send(
        new AdminGetUserCommand({
          UserPoolId: config.COGNITO_USER_POOL_ID,
          Username: oauthUser.username,
        }),
      );
    } catch (e) {
      console.error("linkOAuthCallback: AdminGetUser(federated) failed", e);
      throw httpError({
        error: API_ERRORS.INTERNAL_ERROR,
        details: [
          "Failed to read federated Cognito user after OAuth exchange.",
          e?.message ?? "",
        ],
      });
    }

    const isNativeOAuthSession =
      String(oauthUser.sub || "") === String(identity.cognitoSub || "");

    let authoritative = await getLinkedProviderSlugsForPoolUsername(
      config,
      cognitoResolved.username,
    );

    let providerName;
    let providerSub;
    let identities = [];

    if (isNativeOAuthSession && authoritative.length > 0) {
      console.log(
        "linkOAuthCallback: native OAuth session already has linked providers",
        {
          oauthUsername: oauthUser.username,
          authoritative,
        },
      );
    } else {
      ({ providerName, providerSub, identities } = resolveFederatedLinkSource(
        oauthAdminOut,
        oauthUser.username,
        { expectedProviderSlug },
      ));

      if (!providerName || !providerSub) {
        let nativeAdminOut;
        try {
          nativeAdminOut = await cognitoIDP.send(
            new AdminGetUserCommand({
              UserPoolId: config.COGNITO_USER_POOL_ID,
              Username: cognitoResolved.username,
            }),
          );
        } catch (e) {
          console.warn(
            "linkOAuthCallback: AdminGetUser(native) for federated resolve failed",
            e?.message,
          );
        }

        if (nativeAdminOut) {
          const fromNative = resolveFederatedLinkSource(
            nativeAdminOut,
            cognitoResolved.username,
            { expectedProviderSlug },
          );
          providerName = fromNative.providerName;
          providerSub = fromNative.providerSub;
          identities = fromNative.identities;
        }
      }

      if (!providerName || !providerSub) {
        const federatedPoolUser = await findFederatedSourceUserByEmail(
          config,
          identity.email,
          {
            nativeCognitoSub: identity.cognitoSub,
            expectedProviderSlug,
          },
        );
        if (federatedPoolUser) {
          providerName = federatedPoolUser.providerName;
          providerSub = federatedPoolUser.providerSub;
          console.log(
            "linkOAuthCallback: resolved federated source from pool email scan",
            {
              poolUsername: federatedPoolUser.poolUsername,
              providerName,
            },
          );
        }
      }

      if (!providerName || !providerSub) {
        console.error("linkOAuthCallback: OAUTH_PROVIDER_UNRESOLVED", {
          oauthUsername: oauthUser.username,
          oauthSub: oauthUser.sub,
          nativeUsername: cognitoResolved.username,
          isNativeOAuthSession,
          expectedProviderSlug,
          identities,
        });
        throw httpError({
          error: API_ERRORS.OAUTH_PROVIDER_UNRESOLVED,
          details: ["Could not resolve OAuth provider for AdminLink.", ""],
        });
      }

      const linkedSlug = cognitoProviderDisplayNameToLinkedSlug(providerName);
      const alreadyLinkedInCognito =
        !!linkedSlug && authoritative.includes(linkedSlug);

      if (!alreadyLinkedInCognito) {
        const linkResult = await cognitoTryLinkProviderToNative(config, {
          nativeUserSub: identity.cognitoSub,
          providerName,
          providerSub,
        });

        if (!linkResult.linked && !linkResult.noop) {
          throw httpError({
            error: API_ERRORS.INTERNAL_ERROR,
            details: [
              "Cognito linking failed unexpectedly after duplicate handling.",
            ],
          });
        }
      }

      authoritative = await getLinkedProviderSlugsForPoolUsername(
        config,
        cognitoResolved.username,
      );
    }
    if (!authoritative?.length) {
      throw httpError({
        error: API_ERRORS.OAUTH_PROVIDER_UNRESOLVED,
        details: ["Could not read linkedProviders from Cognito after linking."],
      });
    }

    const linkedProviderLabel =
      providerName ||
      (expectedProviderSlug
        ? expectedProviderSlug.charAt(0).toUpperCase() +
          expectedProviderSlug.slice(1)
        : authoritative[0] || "OAuth provider");

    const updatedIdentity = await updateIdentityLinkedProviders({
      userId: identity.id,
      linkedProviders: authoritative,
    });

    await sendSocialAccountLinkedEmail({
      config,
      databaseUrl: config.POSTGRES_DB_URL,
      identity: updatedIdentity,
      providerLabel: linkedProviderLabel,
    });

    if (nativeRefreshToken) {
      try {
        const resp = await refreshViaOauth(config, nativeRefreshToken);
        const sessionId = generateSessionId();
        const userForSession = {
          ...updatedIdentity,
          sub: updatedIdentity.cognitoSub,
        };
        const refreshOut = resp.refresh_token ?? nativeRefreshToken;

        await storeSession({
          PK: `IDP_SESSION#USER#${updatedIdentity.id}`,
          SK: "METADATA",
          tableName: config.DDB_AUTH_TABLE_NAME,
          accessToken: resp.access_token,
          refreshToken: refreshOut,
          idToken: resp.id_token,
          expiresIn: resp.expires_in,
          sessionId,
          user: userForSession,
          tokenRefreshMode: "oauth",
        });

        const signedIn = sendResponse({
          accessToken: resp.access_token,
          sessionId,
          idToken: resp.id_token,
          expiresIn: resp.expires_in,
          user: updatedIdentity,
        });

        return {
          statusCode: 200,
          data: {
            ...signedIn.data,
            message: `${linkedProviderLabel} linked successfully.`,
            linkedProviders: authoritative,
            providers: authoritative,
            tokensIssued: true,
          },
        };
      } catch (e) {
        console.warn(
          "linkOAuthCallback: refreshViaOauth failed — returning linkage only",
          e,
        );
      }
    }

    return {
      statusCode: 200,
      data: {
        success: true,
        message: `${linkedProviderLabel} linked successfully.`,
        linkedProviders: authoritative,
        providers: authoritative,
        tokensIssued: false,
        tokenRefreshRecommended:
          "Optional: repeat this request including native Hosted UI refreshToken to receive refreshed access/session fields.",
      },
    };
  } catch (error) {
    console.error("Error at linkOAuthCallback:", error);
    rethrowOrInternal(error);
  }
};
