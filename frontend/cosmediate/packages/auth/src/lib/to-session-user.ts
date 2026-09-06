import type {
  AuthMeResponse,
  Gender,
  MeProfileWire,
  SessionUser,
  SessionUserRoleScope,
  UserRole,
  UserStatus,
  WorkingType,
} from "@cosmediate/type-utils";

export type SessionUserProfilePatch = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string | null;
  image?: string | null;
  age?: string;
  gender?: Gender | string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  completeAddress?: string;
  parentClinicId?: string | null;
  clinicIds?: string[];
  workingType?: WorkingType;
};

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function buildClinicScope(profile: MeProfileWire): SessionUserRoleScope {
  const scope: SessionUserRoleScope = {};
  if (typeof profile.parentClinicId === "string") {
    scope.parentClinicId = profile.parentClinicId;
  } else if (profile.parentClinicId === null) {
    scope.parentClinicId = null;
  }
  if (Array.isArray(profile.clinicIds)) {
    scope.clinicIds = profile.clinicIds;
  }
  return scope;
}

function buildScope(
  profile: MeProfileWire,
  role: UserRole,
): SessionUserRoleScope | undefined {
  if (role === "MANAGER") {
    const scope = buildClinicScope(profile);
    return Object.keys(scope).length > 0 ? scope : undefined;
  }

  if (role === "SPECIALIST") {
    const scope = buildClinicScope(profile);
    if (
      profile.workingType === "FREELANCE" ||
      profile.workingType === "FULL_TIME"
    ) {
      scope.workingType = profile.workingType;
    }
    return Object.keys(scope).length > 0 ? scope : undefined;
  }

  return undefined;
}

/** Maps `GET /auth/me` into slim auth-context `SessionUser`. */
export function toSessionUser(me: AuthMeResponse): SessionUser | null {
  if (!me.profileReady || !me.profile || !me.identityId) return null;

  const profile = me.profile;
  const role = (me.role ?? profile.role ?? me.identity.role) as UserRole | null;
  if (!role) return null;

  const identityId = me.identityId;
  const profileId = profile.id;

  return {
    identityId,
    profileId,
    role,
    status: (profile.status ?? me.identity.status) as UserStatus,
    perms: profile.perms ?? me.identity.perms ?? [],
    passwordSet: profile.passwordSet ?? me.identity.passwordSet ?? false,
    defaultPasswordUsed:
      profile.defaultPasswordUsed ?? me.identity.defaultPasswordUsed ?? false,
    linkedProviders:
      profile.linkedProviders ?? me.identity.linkedProviders ?? [],
    cognitoSub: profile.cognitoSub ?? me.identity.cognitoSub,
    firstName: str(profile.firstName),
    lastName: str(profile.lastName),
    fullName: str(profile.fullName),
    email: str(profile.email, me.identity.email),
    phone: profile.phone ?? me.identity.phone ?? null,
    image: profile.image ?? null,
    age: profile.age,
    gender: profile.gender as Gender | undefined,
    country: profile.country,
    state: profile.state,
    city: profile.city,
    postalCode: profile.postalCode,
    completeAddress: profile.completeAddress,
    scope: buildScope(profile, role),
  };
}

function mergeRoleScope(
  role: UserRole,
  current: SessionUser,
  entity: SessionUserProfilePatch,
): SessionUserRoleScope | undefined {
  if (role !== "MANAGER" && role !== "SPECIALIST") {
    return current.scope;
  }

  const scope: SessionUserRoleScope = {
    parentClinicId:
      entity.parentClinicId ?? current.scope?.parentClinicId ?? null,
    clinicIds: entity.clinicIds ?? current.scope?.clinicIds,
  };

  if (role === "SPECIALIST") {
    scope.workingType = entity.workingType ?? current.scope?.workingType;
  }

  return scope;
}

/** After profile save — merge entity fields into existing session user. */
export function patchSessionUserFromProfileEntity(
  current: SessionUser,
  entity: SessionUserProfilePatch & { id?: string },
): SessionUser {
  return {
    ...current,
    profileId: entity.id ?? current.profileId,
    firstName: entity.firstName ?? current.firstName,
    lastName: entity.lastName ?? current.lastName,
    fullName: entity.fullName ?? current.fullName,
    email: entity.email ?? current.email,
    phone: entity.phone ?? current.phone,
    image: entity.image ?? current.image,
    age: entity.age ?? current.age,
    gender: (entity.gender as Gender | undefined) ?? current.gender,
    country: entity.country ?? current.country,
    state: entity.state ?? current.state,
    city: entity.city ?? current.city,
    postalCode: entity.postalCode ?? current.postalCode,
    completeAddress: entity.completeAddress ?? current.completeAddress,
    scope: mergeRoleScope(current.role, current, entity),
  };
}
