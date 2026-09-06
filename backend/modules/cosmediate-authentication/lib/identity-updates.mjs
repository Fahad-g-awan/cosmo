import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { updateIdentity } from "/opt/nodejs/services/prisma/identity/write.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

const ENTITY_TYPE_FOR_ROLE = {
  ADMIN: ENTITY_TYPE.ADMIN,
  SPECIALIST: ENTITY_TYPE.SPECIALIST,
  MANAGER: ENTITY_TYPE.CLINIC_MANAGER,
  PATIENT: ENTITY_TYPE.PATIENT,
};

const patchIdentity = async (identityId, data) => {
  const { config, env } = getRequestContext();

  const identity = await updateIdentity(
    config.POSTGRES_DB_URL,
    identityId,
    data,
  );

  if (identity.role && identity.entityId) {
    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
      schemaVersion: "1",
      entityId: identity.entityId,
      entityType: ENTITY_TYPE_FOR_ROLE[identity.role],
      ENV: env,
    });
  }

  return identity;
};

export const updateIdentityStatus = async ({ userId, status }) => {
  try {
    return await patchIdentity(userId, { status });
  } catch (error) {
    console.error("[auth] updateIdentityStatus", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [`Failed to update user status for ${userId}`],
    });
  }
};

export const updateIdentityDefaultPasswordUsed = async ({ userId, status }) =>
  patchIdentity(userId, { defaultPasswordUsed: status });

/** After the user chooses their own password, clear admin-provisioned default flag. */
export const clearDefaultPasswordIfUsed = async (identity) => {
  if (!identity?.defaultPasswordUsed) {
    return identity;
  }

  return updateIdentityDefaultPasswordUsed({
    userId: identity.id,
    status: false,
  });
};

export const updateIdentityPasswordSet = async ({ userId, status }) =>
  patchIdentity(userId, { passwordSet: status });

export const updateIdentityLinkedProviders = async ({
  userId,
  linkedProviders,
}) => patchIdentity(userId, { linkedProviders });

export const pivotIdentityOauthNativePassword = async ({
  userId,
  cognitoSub,
  linkedProviders,
}) =>
  patchIdentity(userId, {
    cognitoSub,
    passwordSet: true,
    defaultPasswordUsed: false,
    linkedProviders,
  });

