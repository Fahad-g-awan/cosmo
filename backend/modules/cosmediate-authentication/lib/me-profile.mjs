import { resolveManagerEffectiveClinicIds } from "/opt/nodejs/services/prisma/org/manager/effective-scope.mjs";
import { resolveSpecialistClinicScope } from "/opt/nodejs/services/prisma/org/specialist/effective-scope.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";

/** Auth / Identity fields exposed on session bootstrap. */
export const toIdentityDto = (identity) => {
  if (!identity) return null;

  return {
    id: identity.id,
    email: identity.email,
    phone: identity.phone ?? null,
    status: identity.status,
    role: identity.role ?? null,
    entityId: identity.entityId ?? null,
    cognitoSub: identity.cognitoSub,
    perms: identity.perms ?? [],
    defaultPasswordUsed: identity.defaultPasswordUsed ?? false,
    passwordSet: identity.passwordSet ?? false,
    linkedProviders: identity.linkedProviders ?? [],
    createdAt: identity.createdAt,
    updatedAt: identity.updatedAt,
  };
};

/**
 * Merged profile item for GET /auth/me — aligns with admin/patient GET DTOs.
 * `id` is the profile PK (`entityId`); use `identityId` for auth actions.
 */
export const toMeProfileItem = (identity, profile) => {
  if (!identity || !profile) return null;

  const item = {
    ...profile,
    id: profile.id,
    identityId: profile.identityId,
    image: profile.image ?? null,
    email: identity.email,
    phone: identity.phone ?? null,
    status: identity.status,
    perms: identity.perms ?? [],
    cognitoSub: identity.cognitoSub,
    defaultPasswordUsed: identity.defaultPasswordUsed ?? false,
    passwordSet: identity.passwordSet ?? false,
    linkedProviders: identity.linkedProviders ?? [],
    role: identity.role ?? null,
  };

  return item;
};

/**
 * Manager and specialist profiles need clinic scope on GET /auth/me for workspace bootstrap.
 * Raw profile rows omit resolved clinicIds / parentClinicId.
 */
export const enrichMeProfileForRole = async (prisma, role, profile) => {
  if (!profile || !prisma) return profile;

  if (role === USER_ROLES.MANAGER) {
    const { effectiveClinicIds, rootId } =
      await resolveManagerEffectiveClinicIds(prisma, profile.id);

    return {
      ...profile,
      clinicIds: effectiveClinicIds,
      parentClinicId: rootId ?? null,
    };
  }

  if (role === USER_ROLES.SPECIALIST) {
    const { clinicIds, parentClinicId, workingType } =
      await resolveSpecialistClinicScope(prisma, profile.id, profile);

    return {
      ...profile,
      clinicIds,
      parentClinicId,
      workingType,
    };
  }

  return profile;
};
