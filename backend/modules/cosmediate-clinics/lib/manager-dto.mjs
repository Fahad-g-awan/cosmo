import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";

/** API shape: ClinicManager profile + identity auth fields + linked clinics. */
export const toManagerDto = (manager) => {
  if (!manager) return null;

  const { identity, clinics, _count, ...profile } = manager;

  return {
    id: profile.id,
    identityId: profile.identityId,
    entityType: profile.entityType,
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: profile.fullName,
    age: profile.age,
    gender: profile.gender,
    managerImage: profile.image,
    image: profile.image,
    country: profile.country,
    state: profile.state,
    city: profile.city,
    completeAddress: profile.completeAddress,
    postalCode: profile.postalCode,
    lat: profile.lat,
    lon: profile.lon,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    deleted: profile.deleted,
    deletedAt: profile.deletedAt,
    clinics:
      clinics?.map((link) => link.clinic ?? link).filter(Boolean) ??
      manager.clinics ??
      [],
    clinicIds:
      clinics?.map((link) => link.clinicId ?? link.clinic?.id).filter(Boolean) ??
      manager.clinicIds ??
      [],
    clinicCount: manager.clinicCount ?? _count?.clinics ?? 0,
    email: identity?.email ?? manager.email ?? null,
    phone: identity?.phone ?? manager.phone ?? null,
    status: identity?.status ?? manager.status ?? null,
    perms: identity?.perms ?? manager.perms ?? [],
    cognitoSub: identity?.cognitoSub ?? null,
    defaultPasswordUsed: identity?.defaultPasswordUsed ?? false,
    passwordSet: identity?.passwordSet ?? false,
    linkedProviders: identity?.linkedProviders ?? [],
    role: identity?.role ?? USER_ROLES.MANAGER,
  };
};
