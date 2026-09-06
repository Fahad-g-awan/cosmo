import {
  createIdentityWithProfile,
  updateIdentity,
  removeProfile,
} from "/opt/nodejs/services/prisma/identity/write.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import {
  ROLE_DEFAULT_GRANTS,
  PERMISSIONS,
} from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { shouldApplyPermUpdate } from "/opt/nodejs/lib/auth/authorization/grant/perm-update.utils.mjs";
import { assertGrantRequest } from "/opt/nodejs/lib/auth/authorization/grant/grant-scope.utils.mjs";
import { resolveIdentityPerms } from "/opt/nodejs/config/auth/super-access.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { phoneOrNA } from "/opt/nodejs/utils/formatting/phone.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { geocodeAddress } from "/opt/nodejs/lib/location/geocode.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { getClinicsByIds } from "./clinic.repository.mjs";
import {
  logManagerCreate,
  logManagerDelete,
  logManagerUpdate,
} from "./manager-compliance.service.mjs";
import {
  createCognitoManagerUser,
  deleteCognitoManagerUser,
} from "./manager-cognito.service.mjs";
import {
  emitManagerNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
import {
  assertClinicsShareOrg,
  assertManagersInClinicOrg,
} from "./manager-org.mjs";
import { getManagerById, validateManagerEmail } from "./manager.repository.mjs";
import { searchManagers } from "./manager-search.service.mjs";
import { toManagerDto } from "../lib/manager-dto.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC_MANAGER.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create clinic managers"],
    });
  }
};

const assertCanRead = (authContext, targetManagerId) => {
  const isSelf = targetManagerId && targetManagerId === authContext?.entityId;
  if (isSelf && hasPermission(authContext, [PERMISSIONS.PROFILE.READ])) return;
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC_MANAGER.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view clinic managers"],
    });
  }
};

const assertCanUpdate = (authContext, targetManagerId) => {
  const isSelf = targetManagerId && targetManagerId === authContext?.entityId;
  if (isSelf) {
    if (!hasPermission(authContext, [PERMISSIONS.PROFILE.UPDATE])) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["Not authorized to update own profile"],
      });
    }
    return;
  }
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC_MANAGER.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update clinic managers"],
    });
  }
};

const assertCanDelete = (authContext, targetManagerId) => {
  if (targetManagerId === authContext?.entityId) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Cannot delete your own manager account"],
    });
  }
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC_MANAGER.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete clinic managers"],
    });
  }
};

const geocodeManagerAddress = async (config, parts) => {
  const line = parts.filter(Boolean).join(", ");
  if (!line) return { lat: null, lon: null };
  return geocodeAddress(line, config);
};

const CLINIC_ID_LIST_FILTER_KEYS = [
  "clinicIds",
  "scopeClinicIds",
  "clinicId",
  "scopeClinicId",
  "parentClinicId",
  "parentClinicIds",
];

const collectManagerListClinicIds = (filters = {}) => {
  const clinicIds = new Set();

  const add = (value) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((id) => clinicIds.add(id));
      return;
    }
    clinicIds.add(value);
  };

  for (const key of CLINIC_ID_LIST_FILTER_KEYS) {
    add(filters[key]);
  }

  return clinicIds;
};

const normalizeManagerListClinicFilters = (filters = {}) => {
  const scopeClinicId = filters.scopeClinicId;
  const filterClinicId = filters.clinicId;
  const clinicIds = collectManagerListClinicIds({
    clinicIds: filters.clinicIds,
    parentClinicId: filters.parentClinicId,
    parentClinicIds: filters.parentClinicIds,
  });

  for (const key of CLINIC_ID_LIST_FILTER_KEYS) {
    delete filters[key];
  }

  if (filterClinicId) {
    filters.clinicIds = [filterClinicId];
  } else if (scopeClinicId) {
    filters.clinicIds = [scopeClinicId];
  } else if (clinicIds.size) {
    filters.clinicIds = [...clinicIds];
  }

  return filters;
};

const emitClinicReindex = async (config, env, clinicIds) => {
  for (const clinicId of clinicIds) {
    if (!clinicId) continue;
    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
      schemaVersion: "1",
      entityId: clinicId,
      entityType: ENTITY_TYPE.CLINIC,
      ENV: env,
    });
  }
};

/**
 * Creates a clinic manager. Supports `localInvoke` for PARENT clinic bootstrap.
 *
 * @param {object} ctx - Request context from `getRequestContext()`.
 * @param {object} [options]
 * @param {object} [options.managerData] - Pre-validated body when `localInvoke` is true.
 * @param {boolean} [options.localInvoke=false]
 */
export const createManager = async (
  ctx,
  { managerData = {}, localInvoke = false } = {},
) => {
  if (!localInvoke) assertCanCreate(ctx.authContext);

  const reqBody = localInvoke
    ? managerData
    : validateRequestBody(
        CRUD_ACTIONS.CLINIC_MANAGER.CREATE,
        normalizeRequest(ctx.reqBody),
      ).value;

  const {
    parentClinicId = "",
    managerImage = "",
    email = "",
    phone = "",
    age = "",
    gender,
    firstName = "",
    lastName = "",
    country = "",
    state = "",
    city = "",
    postalCode = "",
    completeAddress = "",
    status = "",
    perms = [],
  } = reqBody;

  const clinicIds = [
    ...new Set([...(reqBody?.clinicIds || []), parentClinicId].filter(Boolean)),
  ];

  if (!clinicIds.length) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["A manager must be linked to a clinic"],
    });
  }

  if (clinicIds.length > 1) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["A manager can only be linked to one clinic on create"],
    });
  }

  const { ok: emailOk, errors: emailErrors } = await validateManagerEmail(
    ctx.prisma,
    email,
  );
  if (!emailOk)
    throw httpError({ error: API_ERRORS.CONFLICT, details: emailErrors });

  const {
    clinics: foundClinics,
    ok: clinicOk,
    errors: clinicErrors,
  } = await getClinicsByIds(ctx.prisma, clinicIds);
  if (!clinicOk)
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: clinicErrors });

  await assertClinicsShareOrg(ctx.prisma, clinicIds);

  const { lat, lon } = await geocodeManagerAddress(ctx.config, [
    completeAddress,
    city,
    state,
    postalCode,
    country,
  ]);

  const mergedPerms = resolveIdentityPerms({
    requestedPerms: perms,
    granterRole: ctx.authContext?.role,
    targetRole: USER_ROLES.MANAGER,
    defaultPerms: ROLE_DEFAULT_GRANTS[USER_ROLES.MANAGER],
  });

  if (Array.isArray(perms) && perms.length > 0 && ctx.authContext?.role) {
    assertGrantRequest({
      granterRole: ctx.authContext.role,
      granterGrants: ctx.authContext?.perms?.split?.(" ") ?? [],
      targetRole: USER_ROLES.MANAGER,
      targetCurrentGrants: [],
      requestedGrants: mergedPerms,
    });
  }

  const { sub } = await createCognitoManagerUser({ config: ctx.config, email });

  let newManager;
  try {
    const created = await createIdentityWithProfile(
      ctx.config.POSTGRES_DB_URL,
      {
        identity: {
          cognitoSub: sub,
          email: email.toLowerCase(),
          phone: phoneOrNA(phone),
          status: status || USER_STATUS.ACTIVE,
          perms: mergedPerms,
          defaultPasswordUsed: true,
          passwordSet: true,
          linkedProviders: [],
        },
        role: "MANAGER",
        profile: {
          image: managerImage ?? null,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          age:
            age != null && age !== "" && !Number.isNaN(Number(age))
              ? parseInt(age, 10)
              : null,
          gender: gender ?? null,
          country: country ?? null,
          state: state ?? null,
          city: city ?? null,
          completeAddress: completeAddress ?? null,
          postalCode: postalCode ?? null,
          lat: lat ?? null,
          lon: lon ?? null,
          entityType: ENTITY_TYPE.CLINIC_MANAGER,
          clinics: { create: foundClinics.map((c) => ({ clinicId: c.id })) },
        },
      },
    );
    newManager = created.profile;
  } catch (error) {
    await deleteCognitoManagerUser({ config: ctx.config, email });
    throw error;
  }

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
    schemaVersion: "1",
    entityId: newManager.id,
    entityType: ENTITY_TYPE.CLINIC_MANAGER,
    ENV: ctx.env,
  });

  await emitClinicReindex(ctx.config, ctx.env, clinicIds);

  const { manager: hydrated } = await getManagerById(ctx.prisma, newManager.id);
  const dto = toManagerDto(hydrated);

  if (!localInvoke) {
    try {
      await logManagerCreate({
        tableName: ctx.config.DDB_MAIN_TABLE_NAME,
        authContext: ctx.authContext,
        manager: dto,
      });
    } catch (error) {
      console.error("[createManager] Compliance log failed:", error);
    }
  }

  try {
    await emitManagerNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.CREATED,
      ctx,
      manager: dto,
      clinicIds,
      clinicNames: foundClinics.map((clinic) => clinic.name).filter(Boolean),
    });
  } catch (error) {
    console.error("[createManager] Notification email failed:", error);
  }

  return {
    statusCode: 201,
    data: { message: "Data created successfully", success: true, item: dto },
  };
};

export const getManagerByIdHandler = async (ctx) => {
  const managerId = ctx.queryParams?.id;
  if (!managerId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid manager ID in query params"],
    });
  }

  assertCanRead(ctx.authContext, managerId);

  const { manager, ok } = await getManagerById(ctx.prisma, managerId);

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toManagerDto(manager) : null,
      success: ok,
    },
  };
};

export const listManagers = async (ctx) => {
  if (!hasPermission(ctx.authContext, [PERMISSIONS.CLINIC_MANAGER.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to list clinic managers"],
    });
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.CLINIC_MANAGER.LIST,
    normalizeRequest(ctx.reqBody),
  );
  query.filters = query.filters || {};

  normalizeManagerListClinicFilters(query.filters);

  const indexAlias = `clinic_managers-${ctx.env}`;
  const allRecords = await searchManagers({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map(toManagerDto),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const updateManager = async (ctx) => {
  const normalizedBody = normalizeRequest(ctx.reqBody);
  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.CLINIC_MANAGER.UPDATE,
    normalizedBody,
  );

  const {
    id = "",
    clinicIds,
    managerImage,
    phone,
    age,
    gender,
    firstName,
    lastName,
    country,
    state,
    city,
    postalCode,
    completeAddress,
    status,
    perms,
  } = reqBody;

  assertCanUpdate(ctx.authContext, id);

  const isSelfUpdate = id === ctx.authContext?.entityId;

  const {
    manager: foundManager,
    ok,
    errors,
  } = await getManagerById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const previousClinicIds =
    foundManager.clinics?.map((link) => link.clinicId).filter(Boolean) ?? [];

  let foundClinics = [];
  if (Array.isArray(clinicIds) && clinicIds.length) {
    const clinicResult = await getClinicsByIds(ctx.prisma, clinicIds);
    if (!clinicResult.ok) {
      throw httpError({
        error: API_ERRORS.NOT_FOUND,
        details: clinicResult.errors,
      });
    }
    foundClinics = clinicResult.clinics;
    await assertClinicsShareOrg(ctx.prisma, clinicIds);
    await assertManagersInClinicOrg(ctx.prisma, [id], clinicIds[0]);
  }

  let lat = foundManager.lat;
  let lon = foundManager.lon;
  const locationKeys = [
    "completeAddress",
    "city",
    "state",
    "postalCode",
    "country",
  ];
  const locationProvided = locationKeys.some((key) => key in reqBody);
  if (locationProvided) {
    const parts = [completeAddress, city, state, postalCode, country]
      .map((value) =>
        typeof value === "string" && value.trim() ? value.trim() : null,
      )
      .filter(Boolean);

    if (parts.length) {
      const geocoded = await geocodeManagerAddress(ctx.config, parts);
      lat = geocoded.lat ?? null;
      lon = geocoded.lon ?? null;
    } else {
      lat = null;
      lon = null;
    }
  }

  const updateData = {
    ...(managerImage !== undefined && { image: managerImage || null }),
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(firstName !== undefined || lastName !== undefined
      ? {
          fullName: `${firstName || foundManager.firstName} ${
            lastName || foundManager.lastName
          }`.trim(),
        }
      : {}),
    ...(age !== undefined && {
      age:
        age != null && age !== "" && !Number.isNaN(Number(age))
          ? parseInt(age, 10)
          : null,
    }),
    ...("gender" in reqBody && { gender: gender || null }),
    ...(country !== undefined && { country: country || null }),
    ...(state !== undefined && { state: state || null }),
    ...(city !== undefined && { city: city || null }),
    ...(completeAddress !== undefined && {
      completeAddress: completeAddress || null,
    }),
    ...(postalCode !== undefined && { postalCode: postalCode || null }),
    ...(locationProvided && { lat, lon }),
    ...(Array.isArray(clinicIds) &&
      clinicIds.length > 0 && {
        clinics: {
          deleteMany: {},
          create: foundClinics.map((c) => ({ clinicId: c.id })),
        },
      }),
  };

  const updatedManager = await ctx.prisma.clinicManager.update({
    where: { id: foundManager.id },
    data: updateData,
  });

  let appliedIdentityUpdates = {};

  if (status !== undefined || phone !== undefined || perms !== undefined) {
    const identityUpdates = {
      ...(status !== undefined && { status }),
      ...(phone !== undefined && { phone: phoneOrNA(phone) }),
    };

    if (
      shouldApplyPermUpdate({
        isSelfUpdate,
        requestedPerms: perms,
        currentPerms: foundManager.identity?.perms ?? [],
        authContext: ctx.authContext,
      })
    ) {
      const resolvedPerms = resolveIdentityPerms({
        requestedPerms: perms,
        granterRole: ctx.authContext?.role,
        targetRole: USER_ROLES.MANAGER,
        defaultPerms: ROLE_DEFAULT_GRANTS[USER_ROLES.MANAGER],
      });
      assertGrantRequest({
        granterRole: ctx.authContext?.role ?? "",
        granterGrants: ctx.authContext?.perms?.split?.(" ") ?? [],
        targetRole: USER_ROLES.MANAGER,
        targetCurrentGrants: foundManager.identity?.perms ?? [],
        requestedGrants: resolvedPerms,
      });
      identityUpdates.perms = resolvedPerms;
    }

    if (Object.keys(identityUpdates).length > 0) {
      await updateIdentity(
        ctx.config.POSTGRES_DB_URL,
        foundManager.identityId,
        identityUpdates,
      );
    }

    appliedIdentityUpdates = identityUpdates;
  }

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: updatedManager.id,
    entityType: ENTITY_TYPE.CLINIC_MANAGER,
    ENV: ctx.env,
  });

  if (clinicIds !== undefined) {
    const affectedClinicIds = [
      ...new Set([...previousClinicIds, ...clinicIds]),
    ];
    await emitClinicReindex(ctx.config, ctx.env, affectedClinicIds);
  }

  const { manager: hydrated } = await getManagerById(
    ctx.prisma,
    updatedManager.id,
  );
  const dto = toManagerDto(hydrated);

  await logManagerUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    manager: dto,
    logData: updateData,
  });

  await emitManagerNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    manager: dto,
    previousClinicIds,
    clinicIds,
    isSelfUpdate,
    identityUpdates: appliedIdentityUpdates,
    profileUpdated: Object.keys(updateData).length > 0,
  });

  return {
    statusCode: 200,
    data: { message: "Data updated successfully", success: true, item: dto },
  };
};

export const deleteManager = async (ctx) => {
  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Manager ID is required"],
    });
  }

  assertCanDelete(ctx.authContext, id);

  const { manager, ok, errors } = await getManagerById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toManagerDto(manager);
  const linkedClinicIds =
    manager.clinics?.map((link) => link.clinicId).filter(Boolean) ?? [];

  await removeProfile(ctx.config.POSTGRES_DB_URL, manager.identityId);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: manager.id,
    entityType: ENTITY_TYPE.CLINIC_MANAGER,
    ENV: ctx.env,
  });

  await emitClinicReindex(ctx.config, ctx.env, linkedClinicIds);

  await logManagerDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    manager: dtoBefore,
  });

  await emitManagerNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    manager: dtoBefore,
    previousClinicIds: linkedClinicIds,
  });

  return {
    statusCode: 200,
    data: { message: "Data deleted successfully", success: true },
  };
};
