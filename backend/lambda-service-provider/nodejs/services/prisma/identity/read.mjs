import { API_ERRORS } from "../../../constants/errors/index.mjs";
import { httpError } from "../../../lib/errors/http-error.mjs";
import { getPrisma } from "../../../lib/db/prisma/client.mjs";
import { allRoles, tableFor } from "./role-delegates.mjs";

/**
 * Identity resolution service (read paths).
 *
 * Source of truth for "which profile belongs to this identity" is the FK
 * `profile.identityId`. The `Identity.role` / `Identity.entityId` columns are
 * a denormalized routing pointer for fast auth-path lookups — never used for
 * correctness. See docs/identity-upgrade.md.
 *
 * Lookup patterns:
 *   A. cognitoSub -> identity only           : getIdentityByCognitoSub  (1 query)
 *   B. cognitoSub -> identity + profile      : getIdentityWithProfile   (2 queries happy path)
 *   C. role + entityId -> profile + identity : getProfileWithIdentity   (1 query JOIN)
 */

export const getIdentityByCognitoSub = async (databaseUrl, cognitoSub) => {
  try {
    if (!databaseUrl || !cognitoSub) {
      console.log("[getIdentityByCognitoSub] Invalid parameters");
      return null;
    }

    const prisma = getPrisma(databaseUrl);

    const identity = await prisma.identity.findUnique({
      where: { cognitoSub },
    });

    return identity ?? null;
  } catch (error) {
    console.error("Error occurred at getIdentityByCognitoSub:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [`Failed to fetch identity for sub ${cognitoSub}`],
    });
  }
};

export const getIdentityById = async (databaseUrl, identityId) => {
  try {
    if (!databaseUrl || !identityId) {
      console.log("[getIdentityById] Invalid parameters");
      return null;
    }

    const prisma = getPrisma(databaseUrl);

    const identity = await prisma.identity.findUnique({
      where: { id: identityId },
    });

    return identity ?? null;
  } catch (error) {
    console.error("Error occurred at getIdentityById:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [`Failed to fetch identity ${identityId}`],
    });
  }
};

export const getIdentityByEmail = async (databaseUrl, email) => {
  try {
    if (!databaseUrl || !email) {
      console.log("[getIdentityByEmail] Invalid parameters");
      return null;
    }

    const prisma = getPrisma(databaseUrl);

    const identity = await prisma.identity.findUnique({
      where: { email: email.toLowerCase() },
    });

    return identity ?? null;
  } catch (error) {
    console.error("Error occurred at getIdentityByEmail:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [`Failed to fetch identity for email ${email}`],
    });
  }
};

export const getIdentityWithProfile = async (databaseUrl, cognitoSub) => {
  try {
    if (!databaseUrl || !cognitoSub) {
      console.log("[getIdentityWithProfile] Invalid parameters");
      return null;
    }

    const prisma = getPrisma(databaseUrl);

    const identity = await prisma.identity.findUnique({
      where: { cognitoSub },
    });

    if (!identity) return null;

    if (identity.role && identity.entityId) {
      const delegate = tableFor(identity.role);
      if (delegate) {
        const profile = await prisma[delegate].findUnique({
          where: { id: identity.entityId },
        });

        if (profile && !profile.deleted) {
          return { identity, role: identity.role, profile };
        }

        console.warn(
          `[getIdentityWithProfile] Stale hint for identity=${identity.id} ` +
            `role=${identity.role} entityId=${identity.entityId} — running drift recovery`,
        );
      }
    }

    for (const role of allRoles()) {
      const delegate = tableFor(role);
      const profile = await prisma[delegate].findFirst({
        where: { identityId: identity.id, deleted: false },
      });
      if (profile) {
        prisma.identity
          .update({
            where: { id: identity.id },
            data: { role, entityId: profile.id },
          })
          .catch((err) =>
            console.error(
              `[getIdentityWithProfile] Hint repair failed for identity=${identity.id}:`,
              err,
            ),
          );

        return {
          identity: { ...identity, role, entityId: profile.id },
          role,
          profile,
        };
      }
    }

    return { identity, role: null, profile: null };
  } catch (error) {
    console.error("Error occurred at getIdentityWithProfile:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [`Failed to fetch identity+profile for sub ${cognitoSub}`],
    });
  }
};

export const getProfileWithIdentity = async (databaseUrl, role, entityId) => {
  try {
    if (!databaseUrl || !role || !entityId) {
      console.log("[getProfileWithIdentity] Invalid parameters");
      return null;
    }

    const delegate = tableFor(role);
    if (!delegate) {
      console.warn(`[getProfileWithIdentity] Unknown role: ${role}`);
      return null;
    }

    const prisma = getPrisma(databaseUrl);

    const profile = await prisma[delegate].findUnique({
      where: { id: entityId },
      include: { identity: true },
    });

    if (!profile) return null;

    const { identity, ...profileFields } = profile;
    return { identity, role, profile: profileFields };
  } catch (error) {
    console.error("Error occurred at getProfileWithIdentity:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [`Failed to fetch ${role} profile ${entityId}`],
    });
  }
};
