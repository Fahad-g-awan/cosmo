import {
  rethrowOrInternal,
  httpError,
} from "../../../lib/errors/http-error.mjs";
import { API_ERRORS } from "../../../constants/errors/index.mjs";
import { phoneOrNA } from "../../../utils/formatting/phone.mjs";
import { getPrisma } from "../../../lib/db/prisma/client.mjs";
import { tableFor } from "./role-delegates.mjs";

const softDeleteAt = () => new Date();

export const createIdentityWithProfile = async (
  databaseUrl,
  { identity: identityInput, role, profile: profileInput },
  options = {},
) => {
  try {
    const afterProfileWithinTx =
      typeof options.afterProfileWithinTx === "function"
        ? options.afterProfileWithinTx
        : null;

    if (!databaseUrl) throw new Error("databaseUrl is required");
    if (!identityInput?.cognitoSub)
      throw new Error("identity.cognitoSub is required");
    if (!identityInput?.email) throw new Error("identity.email is required");
    if (!role) throw new Error("role is required");

    const delegate = tableFor(role);
    if (!delegate) throw new Error(`Unknown role: ${role}`);

    const prisma = getPrisma(databaseUrl);

    return await prisma.$transaction(async (tx) => {
      const identity = await tx.identity.create({
        data: {
          cognitoSub: identityInput.cognitoSub,
          email: identityInput.email.toLowerCase(),
          phone: phoneOrNA(identityInput.phone),
          status: identityInput.status ?? "UNCONFIRMED",
          defaultPasswordUsed: identityInput.defaultPasswordUsed ?? false,
          passwordSet: identityInput.passwordSet ?? false,
          linkedProviders: identityInput.linkedProviders ?? [],
          perms: identityInput.perms ?? [],
        },
      });

      const profile = await tx[delegate].create({
        data: {
          ...profileInput,
          identityId: identity.id,
        },
      });

      const updatedIdentity = await tx.identity.update({
        where: { id: identity.id },
        data: { role, entityId: profile.id },
      });

      if (afterProfileWithinTx) {
        await afterProfileWithinTx(tx, {
          identity: updatedIdentity,
          profile,
          roleDelegated: role,
        });
      }

      return { identity: updatedIdentity, role, profile };
    });
  } catch (error) {
    console.error("Error occurred at createIdentityWithProfile:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [`Failed to create identity+profile: ${error.message}`],
    });
  }
};

export const softDeleteIdentity = async (databaseUrl, identityId) => {
  try {
    if (!databaseUrl || !identityId) {
      throw new Error("databaseUrl and identityId are required");
    }

    const prisma = getPrisma(databaseUrl);
    const deletedAt = softDeleteAt();

    const identity = await prisma.identity.update({
      where: { id: identityId },
      data: {
        deleted: true,
        deletedAt,
        role: null,
        entityId: null,
      },
    });

    return identity;
  } catch (error) {
    console.error("Error occurred at softDeleteIdentity:", error);
    rethrowOrInternal(error);
  }
};

/**
 * Soft-deletes the linked profile and Identity, and clears hint columns (single transaction).
 */
export const removeProfile = async (databaseUrl, identityId) => {
  try {
    if (!databaseUrl || !identityId) {
      throw new Error("databaseUrl and identityId are required");
    }

    const prisma = getPrisma(databaseUrl);

    return await prisma.$transaction(async (tx) => {
      const identity = await tx.identity.findUnique({
        where: { id: identityId },
      });

      if (!identity) {
        throw httpError({
          error: API_ERRORS.NOT_FOUND,
          message: "Identity not found",
          details: [`Identity ${identityId}`],
        });
      }

      const deletedAt = softDeleteAt();
      let profile = null;

      if (identity.role && identity.entityId) {
        const delegate = tableFor(identity.role);
        if (!delegate) {
          throw new Error(`Unknown role on identity: ${identity.role}`);
        }

        profile = await tx[delegate].update({
          where: { id: identity.entityId },
          data: { deleted: true, deletedAt },
        });
      }

      const updatedIdentity = await tx.identity.update({
        where: { id: identityId },
        data: {
          deleted: true,
          deletedAt,
          role: null,
          entityId: null,
        },
      });

      return { identity: updatedIdentity, role: null, profile };
    });
  } catch (error) {
    console.error("Error occurred at removeProfile:", error);
    rethrowOrInternal(error);
  }
};

export const updateIdentity = async (databaseUrl, identityId, data) => {
  try {
    if (!databaseUrl || !identityId) {
      throw new Error("databaseUrl and identityId are required");
    }

    const prisma = getPrisma(databaseUrl);

    const allowed = {};
    const allowedKeys = [
      "cognitoSub",
      "email",
      "phone",
      "status",
      "defaultPasswordUsed",
      "passwordSet",
      "linkedProviders",
      "perms",
      "lastLoginAt",
    ];
    for (const key of allowedKeys) {
      if (data[key] !== undefined) allowed[key] = data[key];
    }

    if (allowed.email) allowed.email = allowed.email.toLowerCase();
    if (allowed.phone !== undefined) allowed.phone = phoneOrNA(allowed.phone);

    const identity = await prisma.identity.update({
      where: { id: identityId },
      data: allowed,
    });

    return identity;
  } catch (error) {
    console.error("Error occurred at updateIdentity:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [`Failed to update identity ${identityId}: ${error.message}`],
    });
  }
};
