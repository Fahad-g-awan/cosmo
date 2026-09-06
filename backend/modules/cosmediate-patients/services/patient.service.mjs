import {
  createIdentityWithProfile,
  updateIdentity,
  removeProfile,
} from "/opt/nodejs/services/prisma/identity/write.mjs";
import {
  ROLE_DEFAULT_GRANTS,
  PERMISSIONS,
} from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { applyPatientCreateJunctionWritesInTx } from "/opt/nodejs/services/prisma/org/patient/patient-create-junction.mjs";
import { shouldApplyPermUpdate } from "/opt/nodejs/lib/auth/authorization/grant/perm-update.utils.mjs";
import { assertGrantRequest } from "/opt/nodejs/lib/auth/authorization/grant/grant-scope.utils.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { resolveClinicOrgIds } from "/opt/nodejs/services/prisma/org/clinic/org.mjs";
import { resolveIdentityPerms } from "/opt/nodejs/config/auth/super-access.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
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
  logPatientCreate,
  logPatientDelete,
  logPatientUpdate,
} from "./patient-compliance.service.mjs";
import {
  getPatientById,
  validatePatientEmailAvailable,
} from "./patient.repository.mjs";
import {
  assertPatientListScope,
  assertPatientRecordScope,
} from "../lib/patient-list-scope.mjs";
import { createCognitoPatientUser } from "./patient-cognito.service.mjs";
import { searchPatients } from "./patient-search.service.mjs";
import { toPatientDto } from "../lib/patient-dto.mjs";
import { authActorFromContext } from "../lib/auth-actor.mjs";
import {
  emitPatientNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.PATIENT.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create patients"],
    });
  }
};

const assertCanGet = (authContext, targetPatientId) => {
  const isSelf = targetPatientId && targetPatientId === authContext?.entityId;
  if (isSelf && hasPermission(authContext, [PERMISSIONS.PROFILE.READ])) return;
  if (!hasPermission(authContext, [PERMISSIONS.PATIENT.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view patients"],
    });
  }
};

const assertCanList = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.PATIENT.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to list patients"],
    });
  }
};

const assertCanUpdate = (authContext, targetPatientId) => {
  const isSelf = targetPatientId && targetPatientId === authContext?.entityId;
  if (isSelf) {
    if (!hasPermission(authContext, [PERMISSIONS.PROFILE.UPDATE])) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["Not authorized to update own profile"],
      });
    }
    return;
  }
  if (!hasPermission(authContext, [PERMISSIONS.PATIENT.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update patients"],
    });
  }
};

const assertCanDelete = (authContext, targetPatientId) => {
  if (targetPatientId === authContext?.entityId) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Cannot delete your own patient account"],
    });
  }
  if (!hasPermission(authContext, [PERMISSIONS.PATIENT.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete patients"],
    });
  }
};

const geocodePatientAddress = async (config, parts) => {
  const line = parts.filter(Boolean).join(", ");
  if (!line) return { lat: null, lon: null };
  return geocodeAddress(line, config);
};

const resolvePatientCreationSource = (role) => {
  if (role === USER_ROLES.MANAGER) return "MANAGER";
  if (role === USER_ROLES.SPECIALIST) return "SPECIALIST";
  return "ADMIN";
};

const buildProfileFromBody = (reqBody, geo, creationSource) => ({
  image: reqBody.patientImage ?? null,
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
  entityType: ENTITY_TYPE.PATIENT,
  creationSource,
});

export const createPatient = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.PATIENT.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const email = reqBody.email;
  const creatorRole = ctx.authContext?.role ?? "";
  const { ok, errors } = await validatePatientEmailAvailable(
    ctx.prisma,
    email,
    {
      creatorRole,
    },
  );
  if (!ok) {
    throw httpError({
      error: API_ERRORS.CONFLICT,
      details: errors,
      ...([USER_ROLES.MANAGER, USER_ROLES.SPECIALIST].includes(creatorRole)
        ? { message: errors[0] }
        : {}),
    });
  }

  const { sub } = await createCognitoPatientUser({ config: ctx.config, email });

  const geo = await geocodePatientAddress(ctx.config, [
    reqBody.completeAddress,
    reqBody.city,
    reqBody.state,
    reqBody.postalCode,
    reqBody.country,
  ]);

  const creatorEntityId = ctx.authContext?.entityId ?? "";

  const resolvedPerms = resolveIdentityPerms({
    requestedPerms: reqBody.perms,
    granterRole: ctx.authContext?.role,
    targetRole: USER_ROLES.PATIENT,
    defaultPerms: ROLE_DEFAULT_GRANTS[USER_ROLES.PATIENT],
  });

  if (
    Array.isArray(reqBody.perms) &&
    reqBody.perms.length > 0 &&
    ctx.authContext?.role
  ) {
    assertGrantRequest({
      granterRole: ctx.authContext.role,
      granterGrants: ctx.authContext?.perms?.split?.(" ") ?? [],
      targetRole: USER_ROLES.PATIENT,
      targetCurrentGrants: [],
      requestedGrants: resolvedPerms,
    });
  }

  const { profile: newPatient } = await createIdentityWithProfile(
    ctx.config.POSTGRES_DB_URL,
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
      role: "PATIENT",
      profile: buildProfileFromBody(
        reqBody,
        geo,
        resolvePatientCreationSource(creatorRole),
      ),
    },
    {
      afterProfileWithinTx: async (tx, { profile }) =>
        applyPatientCreateJunctionWritesInTx(tx, {
          creatorRole,
          creatorEntityId,
          patientId: profile.id,
          clinicIdBody: reqBody.clinicId ?? null,
        }),
    },
  );

  const { patient: hydrated } = await getPatientById(ctx.prisma, newPatient.id);
  const dto = toPatientDto(hydrated);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
    schemaVersion: "1",
    entityId: newPatient.id,
    entityType: ENTITY_TYPE.PATIENT,
    ENV: ctx.env,
  });

  let logContext = { clinicId: null, orgRootId: null };
  const junctionClinicId = reqBody.clinicId ?? null;
  if (junctionClinicId) {
    try {
      const { rootId } = await resolveClinicOrgIds(
        ctx.prisma,
        junctionClinicId,
      );
      logContext = { clinicId: junctionClinicId, orgRootId: rootId };
    } catch {
      logContext = { clinicId: junctionClinicId, orgRootId: null };
    }
  }

  await logPatientCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    patient: dto,
    logData: logContext,
  });

  let clinicName = "";
  if (junctionClinicId) {
    const clinicRow = await ctx.prisma.clinic.findFirst({
      where: { id: junctionClinicId, deleted: false },
      select: { name: true },
    });
    clinicName = clinicRow?.name ?? "";
  }

  const actor = authActorFromContext(ctx.authContext);

  await emitPatientNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.CREATED,
    ctx,
    patient: dto,
    creator: actor,
    clinicName,
  });

  return {
    statusCode: 201,
    data: { message: "Data created successfully", success: true, item: dto },
  };
};

export const getPatientByIdHandler = async (ctx) => {
  const patientId = ctx.queryParams?.id;
  if (!patientId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid patient ID in query params"],
    });
  }

  assertCanGet(ctx.authContext, patientId);

  const isSelf = patientId === ctx.authContext?.entityId;
  if (!isSelf) {
    await assertPatientRecordScope(ctx.prisma, ctx.authContext, patientId);
  }

  const { patient, ok } = await getPatientById(ctx.prisma, patientId);

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toPatientDto(patient) : null,
      success: ok ? true : false,
    },
  };
};

export const listPatients = async (ctx) => {
  assertCanList(ctx.authContext);

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.PATIENT.LIST,
    normalizeRequest(ctx.reqBody),
  );

  const scope = await assertPatientListScope(
    ctx.prisma,
    ctx.authContext,
    query.filters ?? {},
  );

  const listFilters = { ...(query.filters ?? {}) };
  delete listFilters.scopeClinicId;

  if (scope.orgRootId) {
    listFilters.orgRootId = scope.orgRootId;

    if (scope.clinicId) {
      listFilters.clinicId = scope.clinicId;
    } else {
      delete listFilters.clinicId;
    }
  } else if (scope.clinicId != null) {
    listFilters.clinicId = scope.clinicId;
  }
  if (scope.specialistId != null) {
    listFilters.specialistId = scope.specialistId;
  }

  const scopedQuery = {
    ...query,
    filters: listFilters,
  };

  const indexAlias = `patients-${ctx.env}`;
  const allRecords = await searchPatients({
    opsClient: ctx.opsClient,
    query: scopedQuery,
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

export const updatePatient = async (ctx) => {
  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.PATIENT.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const { id } = reqBody;
  const isSelfUpdate = id === ctx.authContext?.entityId;
  assertCanUpdate(ctx.authContext, id);
  if (!isSelfUpdate) {
    await assertPatientRecordScope(ctx.prisma, ctx.authContext, id);
  }

  const {
    patient: foundPatient,
    ok,
    errors,
  } = await getPatientById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  let lat = foundPatient.lat;
  let lon = foundPatient.lon;
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
      const geo = await geocodePatientAddress(ctx.config, parts);
      lat = geo.lat ?? null;
      lon = geo.lon ?? null;
    } else {
      lat = null;
      lon = null;
    }
  }

  const updateData = {
    ...(reqBody.patientImage !== undefined && {
      image: reqBody.patientImage || null,
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
          fullName: `${reqBody.firstName ?? foundPatient.firstName ?? ""} ${
            reqBody.lastName ?? foundPatient.lastName ?? ""
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

  await ctx.prisma.patient.update({ where: { id }, data: updateData });

  const identityUpdates = {};
  if (reqBody.status !== undefined) identityUpdates.status = reqBody.status;
  if (reqBody.phone !== undefined)
    identityUpdates.phone = phoneOrNA(reqBody.phone);

  if (
    shouldApplyPermUpdate({
      isSelfUpdate,
      requestedPerms: reqBody.perms,
      currentPerms: foundPatient.identity?.perms ?? [],
      authContext: ctx.authContext,
    })
  ) {
    const resolvedPerms = resolveIdentityPerms({
      requestedPerms: reqBody.perms,
      granterRole: ctx.authContext?.role,
      targetRole: USER_ROLES.PATIENT,
      defaultPerms: ROLE_DEFAULT_GRANTS[USER_ROLES.PATIENT],
    });
    assertGrantRequest({
      granterRole: ctx.authContext?.role ?? "",
      granterGrants: ctx.authContext?.perms?.split?.(" ") ?? [],
      targetRole: USER_ROLES.PATIENT,
      targetCurrentGrants: foundPatient.identity?.perms ?? [],
      requestedGrants: resolvedPerms,
    });
    identityUpdates.perms = resolvedPerms;
  }

  if (Object.keys(identityUpdates).length > 0) {
    await updateIdentity(
      ctx.config.POSTGRES_DB_URL,
      foundPatient.identityId,
      identityUpdates,
    );
  }

  const { patient: refreshed } = await getPatientById(ctx.prisma, id);
  const dto = toPatientDto(refreshed);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: id,
    entityType: ENTITY_TYPE.PATIENT,
    ENV: ctx.env,
  });

  await logPatientUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    patient: dto,
    logData: updateData,
  });

  await emitPatientNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    patient: dto,
    isSelfUpdate,
    identityUpdates,
    profileUpdated: Object.keys(updateData).length > 0,
  });

  return {
    statusCode: 200,
    data: { message: "Data updated successfully", success: true, item: dto },
  };
};

export const deletePatient = async (ctx) => {
  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Patient ID is required"],
    });
  }

  assertCanDelete(ctx.authContext, id);
  await assertPatientRecordScope(ctx.prisma, ctx.authContext, id);

  const {
    patient: foundPatient,
    ok,
    errors,
  } = await getPatientById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toPatientDto(foundPatient);

  const { profile: deletedPatient } = await removeProfile(
    ctx.config.POSTGRES_DB_URL,
    foundPatient.identityId,
  );

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: deletedPatient.id,
    entityType: ENTITY_TYPE.PATIENT,
    ENV: ctx.env,
  });

  await logPatientDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    patient: dtoBefore,
  });

  await emitPatientNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    patient: dtoBefore,
  });

  return {
    statusCode: 200,
    data: {
      message: "Data deleted successfully",
      success: true,
      item: toPatientDto({
        ...deletedPatient,
        identity: foundPatient.identity,
      }),
    },
  };
};
