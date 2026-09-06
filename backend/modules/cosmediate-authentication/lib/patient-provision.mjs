import { PATIENT_CREATION_SOURCE } from "/opt/nodejs/constants/domain/patient.constants.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { createIdentityWithProfile } from "/opt/nodejs/services/prisma/identity/write.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { geocodeAddress } from "/opt/nodejs/lib/location/geocode.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

const geocodeIfPresent = async (config, parts) => {
  const line = parts.filter(Boolean).join(", ");
  if (!line) return { lat: null, lon: null };
  return geocodeAddress(line, config);
};

/**
 * Creates Identity + Patient.
 * Used by public sign-up and OAuth first sign-in.
 */
export const provisionPatientIdentity = async (
  ctx,
  { cognitoSub, email, identity, profile },
) => {
  const geo = await geocodeIfPresent(ctx.config, [
    profile.completeAddress,
    profile.city,
    profile.state,
    profile.postalCode,
    profile.country,
  ]);

  const firstName = profile.firstName ?? "";
  const lastName = profile.lastName ?? "";

  try {
    const { identity: createdIdentity, profile: patient } =
      await createIdentityWithProfile(ctx.config.POSTGRES_DB_URL, {
        identity: {
          cognitoSub,
          email: email.toLowerCase(),
          phone: identity.phone ?? null,
          status: identity.status,
          perms: identity.perms ?? [],
          defaultPasswordUsed: identity.defaultPasswordUsed ?? false,
          passwordSet: identity.passwordSet ?? false,
          linkedProviders: identity.linkedProviders ?? [],
        },
        role: "PATIENT",
        profile: {
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          age: profile.age ?? null,
          country: profile.country ?? null,
          state: profile.state ?? null,
          city: profile.city ?? null,
          completeAddress: profile.completeAddress ?? null,
          postalCode: profile.postalCode ?? null,
          lat: geo.lat ?? null,
          lon: geo.lon ?? null,
          entityType: ENTITY_TYPE.PATIENT,
          creationSource: PATIENT_CREATION_SOURCE.SELF_SIGNUP,
        },
      });

    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
      schemaVersion: "1",
      entityId: patient.id,
      entityType: ENTITY_TYPE.PATIENT,
      ENV: ctx.env,
    });

    return createdIdentity;
  } catch (error) {
    console.error("[auth] provisionPatientIdentity", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["Failed to create patient account"],
    });
  }
};
