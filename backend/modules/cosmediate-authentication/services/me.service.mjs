import { AUTH_BOUNDED_RETRY_FLOWS } from "/opt/nodejs/config/auth/bounded-retry-flows.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { getIdentityWithProfile } from "/opt/nodejs/services/prisma/identity/read.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  toIdentityDto,
  toMeProfileItem,
  enrichMeProfileForRole,
} from "../lib/me-profile.mjs";
import { requireSessionAuthContext } from "/opt/nodejs/lib/auth/authorization/session-auth.mjs";
import { findIdentityById } from "../lib/identity.mjs";

function normSlug(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

function uniqSortedSlugs(linkedProviders) {
  const raw = Array.isArray(linkedProviders) ? linkedProviders : [];
  return [...new Set(raw.map(normSlug).filter(Boolean))].sort();
}

function buildCanRemovePassword(passwordSet, slugs) {
  return !!(passwordSet && slugs.length > 0);
}

function buildCanUnlink(passwordSet, slugs) {
  const out = {};
  for (const slug of slugs) {
    const rest = slugs.filter((s) => s !== slug);
    out[slug] = passwordSet === true || rest.length > 0;
  }
  return out;
}

function permissionList(authContext) {
  const raw = authContext?.perms;
  return String(raw ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** GET /auth/me — current session: Identity + role profile. */
export const getAuthMe = async (ctx) => {
  const { config, authContext, prisma } = ctx;
  const { cognitoSub } = requireSessionAuthContext(authContext);

  const resolved = await getIdentityWithProfile(
    config.POSTGRES_DB_URL,
    cognitoSub,
  );

  if (!resolved?.identity) {
    throw httpError({
      error: API_ERRORS.USER_NOT_FOUND,
      details: ["Identity record not available."],
    });
  }

  const { identity, role, profile } = resolved;

  if (identity.cognitoSub !== cognitoSub) {
    throw httpError({
      error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
      details: ["Session does not match this Identity."],
    });
  }

  const identityDto = toIdentityDto(identity);
  const enrichedProfile = await enrichMeProfileForRole(prisma, role, profile);
  const profileItem = toMeProfileItem(identity, enrichedProfile);

  return {
    statusCode: 200,
    data: {
      success: true,
      identityId: identity.id,
      profileId: identity.entityId ?? profile?.id ?? null,
      role: role ?? identity.role ?? null,
      identity: identityDto,
      profile: profileItem,
      profileReady: profileItem != null,
    },
  };
};

/** GET /auth/me/methods — sign-in methods projection for the SPA. */
export const getAuthMeMethods = async (ctx) => {
  const { config, authContext } = ctx;
  const { cognitoSub, identityId } = requireSessionAuthContext(authContext);

  const { user: identity } = await findIdentityById(
    config.POSTGRES_DB_URL,
    identityId,
  );

  if (!identity) {
    throw httpError({
      error: API_ERRORS.USER_NOT_FOUND,
      details: ["Identity record not available."],
    });
  }

  if (identity.cognitoSub !== cognitoSub) {
    throw httpError({
      error: API_ERRORS.COGNITO_IDENTITY_MISMATCH,
      details: ["Session does not match this Identity."],
    });
  }

  const linkedProviders = uniqSortedSlugs(identity.linkedProviders);
  const passwordSet = !!identity.passwordSet;
  const canRemovePassword = buildCanRemovePassword(
    passwordSet,
    linkedProviders,
  );
  const canUnlink = buildCanUnlink(passwordSet, linkedProviders);
  const hasMinimumOneSignInMethod =
    passwordSet === true || linkedProviders.length > 0;

  const permList = permissionList(authContext);
  const oauthLinkPermitted = permList.includes(PERMISSIONS.SECURITY.UPDATE);

  return {
    statusCode: 200,
    data: {
      success: true,
      identityId: identity.id,
      email: identity.email,
      passwordSet,
      linkedProviders,
      canRemovePassword,
      canUnlink,
      hasMinimumOneSignInMethod,
      oauthLinkPermitted,
      boundedRetryFlows: [...AUTH_BOUNDED_RETRY_FLOWS],
    },
  };
};
