import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { createIdentityWithProfile } from "/opt/nodejs/services/prisma/identity/write.mjs";
import { getRoleDefaultGrants } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

/**
 * OAuth-first (or orphan) patient: Identity + Patient before PreToken runs.
 * Mirrors auth `provisionPatientIdentity` without geocode (no address on federated sign-up).
 */
export const provisionPatientIfMissing = async (
  config,
  { cognitoSub, email, status, passwordSet, linkedProviders, profile },
) => {
  const firstName = profile.firstName ?? "";
  const lastName = profile.lastName ?? "";

  const { identity, profile: patient } = await createIdentityWithProfile(
    config.POSTGRES_DB_URL,
    {
      identity: {
        cognitoSub,
        email: email.toLowerCase(),
        phone: null,
        status,
        perms: getRoleDefaultGrants(USER_ROLES.PATIENT),
        defaultPasswordUsed: false,
        passwordSet,
        linkedProviders: linkedProviders ?? [],
      },
      role: USER_ROLES.PATIENT,
      profile: {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        age: null,
        country: null,
        state: null,
        city: null,
        completeAddress: null,
        postalCode: null,
        lat: null,
        lon: null,
        entityType: ENTITY_TYPE.PATIENT,
      },
    },
  );

  if (config.EVENT_BUS_NAME) {
    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
      schemaVersion: "1",
      entityId: patient.id,
      entityType: ENTITY_TYPE.PATIENT,
      ENV: config.ENV,
    });
  } else {
    console.warn(
      "[post-confirmation] EVENT_BUS_NAME not set — patient created without index emit",
    );
  }

  return identity;
};
