import {
  createIdentityWithProfile,
  updateIdentity,
  removeProfile,
} from "/opt/nodejs/services/prisma/identity/write.mjs";
import { shouldApplyPermUpdate } from "/opt/nodejs/lib/auth/authorization/grant/perm-update.utils.mjs";
import { assertGrantRequest } from "/opt/nodejs/lib/auth/authorization/grant/grant-scope.utils.mjs";
import {
  ROLE_DEFAULT_GRANTS,
  PERMISSIONS,
} from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { resolveIdentityPerms } from "/opt/nodejs/config/auth/super-access.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { phoneOrNA } from "/opt/nodejs/utils/formatting/phone.mjs";
import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { geocodeAddress } from "/opt/nodejs/lib/location/geocode.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  logAdminCreate,
  logAdminDelete,
  logAdminUpdate,
} from "./admin-compliance.service.mjs";
import {
  getAdminById,
  validateAdminEmailAvailable,
} from "./admin.repository.mjs";
import {
  emitAdminNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { createCognitoAdminUser } from "./admin-cognito.service.mjs";
import { searchAdmins } from "./admin-search.service.mjs";
import { toAdminDto } from "../lib/admin-dto.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.ADMIN.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create admins"],
    });
  }
};

const assertCanGet = (authContext, targetAdminId) => {
  const isSelf = targetAdminId && targetAdminId === authContext?.entityId;
  if (isSelf && hasPermission(authContext, [PERMISSIONS.PROFILE.READ])) return;
  if (!hasPermission(authContext, [PERMISSIONS.ADMIN.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to list or view admins"],
    });
  }
};

const assertCanUpdate = (authContext, targetAdminId) => {
  const isSelf = targetAdminId && targetAdminId === authContext?.entityId;
  if (isSelf) {
    if (!hasPermission(authContext, [PERMISSIONS.PROFILE.UPDATE])) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["Not authorized to update own profile"],
      });
    }
    return;
  }
  if (!hasPermission(authContext, [PERMISSIONS.ADMIN.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update admins"],
    });
  }
};

const assertCanDelete = (authContext, targetAdminId) => {
  if (targetAdminId === authContext?.entityId) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Cannot delete your own admin account"],
    });
  }
  if (!hasPermission(authContext, [PERMISSIONS.ADMIN.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete admins"],
    });
  }
};

const geocodeAdminAddress = async (config, parts) => {
  const line = parts.filter(Boolean).join(", ");
  if (!line) return { lat: null, lon: null };
  return geocodeAddress(line, config);
};

const buildProfileFromBody = (reqBody, geo) => ({
  image: reqBody.adminImage ?? null,
  firstName: reqBody.firstName,
  lastName: reqBody.lastName,
  fullName: `${reqBody.firstName} ${reqBody.lastName}`.trim(),
  age:
    reqBody.age != null &&
    reqBody.age !== "" &&
    !Number.isNaN(Number(reqBody.age))
      ? parseInt(reqBody.age, 10)
      : null,
  gender: reqBody.gender ?? null,
  country: reqBody.country ?? null,
  state: reqBody.state ?? null,
  city: reqBody.city ?? null,
  completeAddress: reqBody.completeAddress ?? null,
  postalCode: reqBody.postalCode ?? null,
  lat: geo.lat ?? null,
  lon: geo.lon ?? null,
  entityType: ENTITY_TYPE.ADMIN,
});

/**
 * Shared create path for POST /admins and POST /admins/bootstrap.
 */
export const createAdminRecord = async ({
  config,
  prisma,
  authContext,
  env,
  reqBody,
  defaultPerms = ROLE_DEFAULT_GRANTS[USER_ROLES.ADMIN],
  skipPermissionCheck = false,
}) => {
  if (!skipPermissionCheck) assertCanCreate(authContext);

  const email = reqBody.email;
  const { ok, errors } = await validateAdminEmailAvailable(prisma, email);
  if (!ok) throw httpError({ error: API_ERRORS.CONFLICT, details: errors });

  const resolvedPerms = resolveIdentityPerms({
    requestedPerms: reqBody.perms,
    granterRole: authContext?.role,
    targetRole: USER_ROLES.ADMIN,
    defaultPerms,
  });

  if (
    Array.isArray(reqBody.perms) &&
    reqBody.perms.length > 0 &&
    authContext?.role
  ) {
    assertGrantRequest({
      granterRole: authContext.role,
      granterGrants: authContext?.perms?.split?.(" ") ?? [],
      targetRole: USER_ROLES.ADMIN,
      targetCurrentGrants: [],
      requestedGrants: resolvedPerms,
    });
  }

  const { sub } = await createCognitoAdminUser({ config, email });

  const geo = await geocodeAdminAddress(config, [
    reqBody.completeAddress,
    reqBody.city,
    reqBody.state,
    reqBody.postalCode,
    reqBody.country,
  ]);

  const { profile: newAdmin } = await createIdentityWithProfile(
    config.POSTGRES_DB_URL,
    {
      identity: {
        cognitoSub: sub,
        email: email.toLowerCase(),
        phone: phoneOrNA(reqBody.phone),
        status: reqBody.status || USER_STATUS.ACTIVE,
        perms: resolvedPerms,
        defaultPasswordUsed: true,
        passwordSet: true,
        linkedProviders: [],
      },
      role: "ADMIN",
      profile: buildProfileFromBody(reqBody, geo),
    },
  );

  const hydrated = await getAdminById(prisma, newAdmin.id);
  const dto = toAdminDto(hydrated.admin);

  await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
    schemaVersion: "1",
    entityId: newAdmin.id,
    entityType: ENTITY_TYPE.ADMIN,
    ENV: env,
  });

  const actor = authContext ?? {
    entityId: dto.id,
    email: dto.email,
    cognitoSub: dto.cognitoSub,
    role: dto.role,
    fullName: dto.fullName,
  };

  await logAdminCreate({
    tableName: config.DDB_MAIN_TABLE_NAME,
    authContext: actor,
    admin: dto,
  });

  await emitAdminNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.CREATED,
    ctx: { authContext: actor, config },
    admin: dto,
  });

  return dto;
};

export const createAdmin = async (ctx) => {
  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.ADMIN.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const item = await createAdminRecord({
    config: ctx.config,
    prisma: ctx.prisma,
    authContext: ctx.authContext,
    env: ctx.env,
    reqBody,
  });

  return {
    statusCode: 201,
    data: { message: "Data created successfully", success: true, item },
  };
};

export const getAdminByIdHandler = async (ctx) => {
  const adminId = ctx.queryParams?.id;
  if (!adminId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid admin ID in query params"],
    });
  }

  assertCanGet(ctx.authContext, adminId);

  const { admin, ok } = await getAdminById(ctx.prisma, adminId);

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toAdminDto(admin) : null,
      success: ok ? true : false,
    },
  };
};

const assertCanList = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.ADMIN.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to list admins"],
    });
  }
};

export const listAdmins = async (ctx) => {
  assertCanList(ctx.authContext);

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.ADMIN.LIST,
    normalizeRequest(ctx.reqBody),
  );
  const indexAlias = `admins-${ctx.env}`;
  const allRecords = await searchAdmins({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items,
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0 ? true : false,
    },
  };
};

export const updateAdmin = async (ctx) => {
  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.ADMIN.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const { id } = reqBody;
  const isSelfUpdate = id === ctx.authContext?.entityId;
  assertCanUpdate(ctx.authContext, id);

  const { admin: foundAdmin, ok, errors } = await getAdminById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  let lat = foundAdmin.lat;
  let lon = foundAdmin.lon;
  const locationKeys = [
    "completeAddress",
    "city",
    "state",
    "postalCode",
    "country",
  ];
  const locationProvided = locationKeys.some((key) => key in reqBody);
  if (locationProvided) {
    const parts = [
      reqBody.completeAddress,
      reqBody.city,
      reqBody.state,
      reqBody.postalCode,
      reqBody.country,
    ]
      .map((value) =>
        typeof value === "string" && value.trim() ? value.trim() : null,
      )
      .filter(Boolean);

    if (parts.length) {
      const geo = await geocodeAdminAddress(ctx.config, parts);
      lat = geo.lat ?? null;
      lon = geo.lon ?? null;
    } else {
      lat = null;
      lon = null;
    }
  }

  const updateData = {
    ...(reqBody.adminImage !== undefined && {
      image: reqBody.adminImage || null,
    }),
    ...(reqBody.age !== undefined && {
      age:
        reqBody.age != null &&
        reqBody.age !== "" &&
        !Number.isNaN(Number(reqBody.age))
          ? parseInt(reqBody.age, 10)
          : null,
    }),
    ...(reqBody.gender !== undefined && { gender: reqBody.gender || null }),
    ...(reqBody.firstName !== undefined && { firstName: reqBody.firstName }),
    ...(reqBody.lastName !== undefined && { lastName: reqBody.lastName }),
    ...(reqBody.firstName !== undefined || reqBody.lastName !== undefined
      ? {
          fullName: `${reqBody.firstName ?? foundAdmin.firstName ?? ""} ${
            reqBody.lastName ?? foundAdmin.lastName ?? ""
          }`.trim(),
        }
      : {}),
    ...(reqBody.country !== undefined && { country: reqBody.country || null }),
    ...(reqBody.state !== undefined && { state: reqBody.state || null }),
    ...(reqBody.city !== undefined && { city: reqBody.city || null }),
    ...(reqBody.completeAddress !== undefined && {
      completeAddress: reqBody.completeAddress || null,
    }),
    ...(reqBody.postalCode !== undefined && {
      postalCode: reqBody.postalCode || null,
    }),
    ...(locationProvided && { lat, lon }),
  };

  await ctx.prisma.admin.update({ where: { id }, data: updateData });

  const identityUpdates = {};
  if (reqBody.status !== undefined) identityUpdates.status = reqBody.status;
  if (reqBody.phone !== undefined)
    identityUpdates.phone = phoneOrNA(reqBody.phone);

  if (
    shouldApplyPermUpdate({
      isSelfUpdate,
      requestedPerms: reqBody.perms,
      currentPerms: foundAdmin.identity?.perms ?? [],
      authContext: ctx.authContext,
    })
  ) {
    const resolvedPerms = resolveIdentityPerms({
      requestedPerms: reqBody.perms,
      granterRole: ctx.authContext?.role,
      targetRole: USER_ROLES.ADMIN,
      defaultPerms: ROLE_DEFAULT_GRANTS[USER_ROLES.ADMIN],
    });
    assertGrantRequest({
      granterRole: ctx.authContext?.role ?? "",
      granterGrants: ctx.authContext?.perms?.split?.(" ") ?? [],
      targetRole: USER_ROLES.ADMIN,
      targetCurrentGrants: foundAdmin.identity?.perms ?? [],
      requestedGrants: resolvedPerms,
    });
    identityUpdates.perms = resolvedPerms;
  }

  if (Object.keys(identityUpdates).length > 0) {
    await updateIdentity(
      ctx.config.POSTGRES_DB_URL,
      foundAdmin.identityId,
      identityUpdates,
    );
  }

  const { admin: refreshed } = await getAdminById(ctx.prisma, id);
  const dto = toAdminDto(refreshed);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: id,
    entityType: ENTITY_TYPE.ADMIN,
    ENV: ctx.env,
  });

  await logAdminUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    admin: dto,
    logData: updateData,
  });

  await emitAdminNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    admin: dto,
    isSelfUpdate,
    identityUpdates,
    profileUpdated: Object.keys(updateData).length > 0,
  });

  return {
    statusCode: 200,
    data: { message: "Data updated successfully", success: true, item: dto },
  };
};

export const deleteAdmin = async (ctx) => {
  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Admin ID is required"],
    });
  }

  assertCanDelete(ctx.authContext, id);

  const { admin: foundAdmin, ok, errors } = await getAdminById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toAdminDto(foundAdmin);

  const { profile: deletedAdmin } = await removeProfile(
    ctx.config.POSTGRES_DB_URL,
    foundAdmin.identityId,
  );

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: deletedAdmin.id,
    entityType: ENTITY_TYPE.ADMIN,
    ENV: ctx.env,
  });

  await logAdminDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    admin: dtoBefore,
  });

  await emitAdminNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    admin: dtoBefore,
  });

  return {
    statusCode: 200,
    data: {
      message: "Data deleted successfully",
      success: true,
      item: toAdminDto({ ...deletedAdmin, identity: foundAdmin.identity }),
    },
  };
};
