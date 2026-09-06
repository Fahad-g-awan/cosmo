import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";

/** API shape: profile + identity auth fields. */
export const toAdminDto = (admin) => {
  if (!admin) return null;

  const { identity, ...profile } = admin;

  return {
    id: profile.id,
    identityId: profile.identityId,
    entityType: profile.entityType,
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: profile.fullName,
    age: profile.age,
    gender: profile.gender,
    adminImage: profile.image,
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
    email: identity?.email ?? null,
    phone: identity?.phone ?? null,
    status: identity?.status ?? null,
    perms: identity?.perms ?? [],
    cognitoSub: identity?.cognitoSub ?? null,
    defaultPasswordUsed: identity?.defaultPasswordUsed ?? false,
    passwordSet: identity?.passwordSet ?? false,
    linkedProviders: identity?.linkedProviders ?? [],
    role: identity?.role ?? USER_ROLES.ADMIN,
  };
};
