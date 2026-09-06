import {
  AdminGetUserCommand,
  AdminLinkProviderForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import {
  linkedProviderSlugsFromCognitoIdentities,
  cognitoProviderDisplayNameToLinkedSlug,
  parseCognitoExternalUsername,
  cognitoProviderSortKey,
} from "../../lib/auth/cognito/provider.utils.mjs";
import { COGNITO_FEDERATED_PREFIX_TO_PROVIDER_NAME } from "../../constants/auth/cognito/provider.constants.mjs";
import { listCognitoUsersByEmail } from "../../lib/auth/cognito/admin-users.mjs";
import { cognitoIDP } from "../../lib/auth/cognito-idp.client.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../../lib/errors/http-error.mjs";

/**
 * List all pool users matching `email` attribute, paginated; pick rows where `sub`
 * matches Postgres `Identity.cognitoSub`. Never guesses `Users[0]`.
 *
 * @returns {{ ok: true, username: string, inspectedCount: number } | { ok: false, reason: 'none'|'ambiguous', inspectedCount: number, matchCount?: number }}
 */
export async function resolveCognitoUsernameByEmailAndSub(
  config,
  email,
  cognitoSub,
) {
  if (!config?.COGNITO_USER_POOL_ID || !email || !cognitoSub) {
    return { ok: false, reason: "none", inspectedCount: 0 };
  }

  try {
    const allUsers = await listCognitoUsersByEmail(config, email);

    const withSub = allUsers.filter((u) => {
      const sub = u.Attributes?.find((a) => a.Name === "sub")?.Value;
      return sub === cognitoSub;
    });

    if (withSub.length === 1) {
      return {
        ok: true,
        username: withSub[0].Username,
        inspectedCount: allUsers.length,
      };
    }
    if (withSub.length > 1) {
      return {
        ok: false,
        reason: "ambiguous",
        inspectedCount: allUsers.length,
        matchCount: withSub.length,
      };
    }
    return { ok: false, reason: "none", inspectedCount: allUsers.length };
  } catch (e) {
    console.error("resolveCognitoUsernameByEmailAndSub ListUsers error:", e);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["Failed to resolve Cognito username", e?.message],
    });
  }
}

export function identitiesFromAdminUser(adminOutput) {
  const raw =
    adminOutput?.UserAttributes?.find((a) => a.Name === "identities")?.Value ??
    "";
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const expectedProviderSortKey = (expectedProviderSlug) => {
  const slug = String(expectedProviderSlug ?? "")
    .trim()
    .toLowerCase();
  if (!slug) return "";
  const display =
    COGNITO_FEDERATED_PREFIX_TO_PROVIDER_NAME[slug] ??
    (slug === "apple" ? "SignInWithApple" : null);
  return cognitoProviderSortKey(display || slug);
};

/**
 * Source for `AdminLinkProviderForUser`: Cognito **`ProviderName`** + external subject **`userId`**.
 *
 * @param {AdminGetUserCommandOutput} adminGetUserOutput
 * @param {string} oauthPoolUsername
 * @param {{ expectedProviderSlug?: string | null }} [options]
 * @returns {{ providerName: string, providerSub: string, identities: Array<{ providerName: string, userId: string }> }}
 */
export function resolveFederatedLinkSource(
  adminGetUserOutput,
  oauthPoolUsername,
  { expectedProviderSlug = null } = {},
) {
  const identities = identitiesFromAdminUser(adminGetUserOutput);
  const parsed = parseCognitoExternalUsername(oauthPoolUsername || "");
  const targetKey =
    expectedProviderSortKey(expectedProviderSlug) ||
    cognitoProviderSortKey(parsed.cognitoProviderName || "");

  const firstLinkedIdentity =
    identities.find((id) => id?.providerName && id?.userId) ?? null;

  const row =
    (targetKey
      ? identities.find(
          (id) =>
            cognitoProviderSortKey(id?.providerName || "") === targetKey &&
            id?.userId,
        )
      : null) ??
    firstLinkedIdentity;

  const providerName = row?.providerName || parsed.cognitoProviderName || null;
  const providerSub = row?.userId ?? parsed.providerSubject ?? null;

  return { providerName, providerSub, identities };
}

/**
 * When Hosted UI returns a native session, a separate federated pool user may still exist.
 *
 * @returns {{ providerName: string, providerSub: string, poolUsername: string } | null}
 */
export async function findFederatedSourceUserByEmail(
  config,
  email,
  { nativeCognitoSub = null, expectedProviderSlug = null } = {},
) {
  if (!email || !config?.COGNITO_USER_POOL_ID) return null;

  const allUsers = await listCognitoUsersByEmail(config, email);
  const expectedKey = expectedProviderSortKey(expectedProviderSlug);

  for (const user of allUsers) {
    const sub = user.Attributes?.find((a) => a.Name === "sub")?.Value;
    if (nativeCognitoSub && sub === nativeCognitoSub) continue;

    const parsed = parseCognitoExternalUsername(user.Username || "");
    if (!parsed.cognitoProviderName || !parsed.providerSubject) continue;

    if (
      expectedKey &&
      cognitoProviderSortKey(parsed.cognitoProviderName) !== expectedKey
    ) {
      continue;
    }

    return {
      providerName: parsed.cognitoProviderName,
      providerSub: parsed.providerSubject,
      poolUsername: user.Username,
    };
  }

  return null;
}

/**
 * Call after native `sub` already matches token (`already merged`): link is unnecessary.
 */
export async function cognitoTryLinkProviderToNative(
  config,
  { nativeUserSub, providerName, providerSub },
) {
  const linkParams = {
    UserPoolId: config.COGNITO_USER_POOL_ID,
    DestinationUser: {
      ProviderName: "Cognito",
      ProviderAttributeValue: nativeUserSub,
    },
    SourceUser: {
      ProviderName: providerName,
      ProviderAttributeName: "Cognito_Subject",
      ProviderAttributeValue: providerSub,
    },
  };

  try {
    await cognitoIDP.send(new AdminLinkProviderForUserCommand(linkParams));
    return { linked: true };
  } catch (e) {
    const name = String(e?.name || e?.Code || "").toUpperCase();
    const msg = String(e?.message || "").toLowerCase();
    const noop =
      name.includes("ALIAS_EXISTS") ||
      name.includes("DUPLICATE") ||
      msg.includes("already") ||
      msg.includes("duplicate") ||
      msg.includes("entry for username");

    if (noop) {
      console.warn(
        "cognitoTryLinkProviderToNative noop (already linked or duplicate)",
        {
          nativeUserSub,
          providerName,
          message: e?.message,
          name,
        },
      );
      return { linked: false, noop: true };
    }
    console.error("cognitoTryLinkProviderToNative fatal:", e);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["Failed to link federated identity to native user", e?.message],
    });
  }
}

/**
 * Canonical slugs Cognito attaches to **`identities`** for this pool **`Username`**.
 * Fallback: parsed federated **`userName`** prefix when **`AdminGetUser`** fails or identities empty.
 */
export async function getLinkedProviderSlugsForPoolUsername(config, username) {
  if (!username || !config?.COGNITO_USER_POOL_ID) return [];

  try {
    const adminOut = await cognitoIDP.send(
      new AdminGetUserCommand({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        Username: username,
      }),
    );
    const identities = identitiesFromAdminUser(adminOut);
    let slugs = linkedProviderSlugsFromCognitoIdentities(identities);
    if (!slugs.length) {
      const slug = cognitoProviderDisplayNameToLinkedSlug(
        parseCognitoExternalUsername(username).cognitoProviderName,
      );
      if (slug) slugs = [slug];
    }
    return [...slugs].sort();
  } catch (e) {
    console.warn(
      "getLinkedProviderSlugsForPoolUsername: AdminGetUser failed, fallback parse",
      { username, message: e?.message },
    );
    const slug = cognitoProviderDisplayNameToLinkedSlug(
      parseCognitoExternalUsername(username).cognitoProviderName,
    );
    return slug ? [slug].sort() : [];
  }
}

export const cognitoLinkProviderToUser = async (config, params) => {
  try {
    const { nativeUserSub, providerName, providerSub } = params;

    const linkParams = {
      UserPoolId: config.COGNITO_USER_POOL_ID,
      DestinationUser: {
        ProviderName: "Cognito",
        ProviderAttributeValue: nativeUserSub,
      },
      SourceUser: {
        ProviderName: providerName,
        ProviderAttributeName: "Cognito_Subject",
        ProviderAttributeValue: providerSub,
      },
    };

    console.log("Linking provider to user:", {
      nativeUserSub,
      providerName,
      providerSub,
    });

    await cognitoIDP.send(new AdminLinkProviderForUserCommand(linkParams));

    console.log(
      `Successfully linked ${providerName} (sub: ${providerSub}) to native user (sub: ${nativeUserSub})`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error in cognitoLinkProviderToUser:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["Failed to link provider to user", error?.message],
    });
  }
};
