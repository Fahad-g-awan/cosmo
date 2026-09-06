import {
  createIdentityWithProfile,
  updateIdentity,
  removeProfile,
} from "/opt/nodejs/services/prisma/identity/write.mjs";
import {
  ROLE_DEFAULT_GRANTS,
  PERMISSIONS,
} from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { shouldApplyPermUpdate } from "/opt/nodejs/lib/auth/authorization/grant/perm-update.utils.mjs";
import { assertGrantRequest } from "/opt/nodejs/lib/auth/authorization/grant/grant-scope.utils.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { WORKING_TYPES } from "/opt/nodejs/constants/domain/shared.constants.mjs";
import { resolveIdentityPerms } from "/opt/nodejs/config/auth/super-access.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { phoneOrNA } from "/opt/nodejs/utils/formatting/phone.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { geocodeAddress } from "/opt/nodejs/lib/location/geocode.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { normalizeSpecialistMultipartBody } from "../lib/specialist-request.mjs";
import { resolveSpecialistListFilters } from "../lib/specialist-list-scope.mjs";
import { toSpecialistDto } from "../lib/specialist-dto.mjs";
import { isManagementRoute } from "../lib/route-scope.mjs";
import {
  assertClinicManagerCanCreateSpecialist,
  assertClinicManagerCanUpdateSpecialist,
} from "../lib/specialist-org.mjs";
import { resolveClinicOrgIds } from "/opt/nodejs/services/prisma/org/clinic/org.mjs";
import {
  emitSpecialistNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
import {
  logSpecialistCreate,
  logSpecialistDelete,
  logSpecialistUpdate,
} from "./specialist-compliance.service.mjs";
import {
  getSpecialistById,
  validateSpecialistEmail,
} from "./specialist.repository.mjs";
import { createCognitoSpecialistUser } from "./specialist-cognito.service.mjs";
import { searchSpecialists } from "./specialist-search.service.mjs";
import { getClinicsByIds } from "./clinic.repository.mjs";
import { syncSpecialistClinicLinksInTx } from "../lib/clinic-specialist-treatment-cascade.mjs";

const resolveSpecialistMutationLogContext = async (
  prisma,
  { workingType, parentClinicId, activeClinicId, targetClinicIds = [] },
) => {
  const clinicId =
    workingType === WORKING_TYPES.FULL_TIME
      ? parentClinicId || activeClinicId || targetClinicIds[0] || null
      : targetClinicIds[0] || null;

  if (!clinicId) {
    return { clinicId: null, orgRootId: null };
  }

  try {
    const { rootId } = await resolveClinicOrgIds(prisma, clinicId);
    return { clinicId, orgRootId: rootId };
  } catch {
    return { clinicId, orgRootId: null };
  }
};

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.SPECIALIST.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create specialists"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.SPECIALIST.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view specialists"],
    });
  }
};

const assertCanUpdate = (authContext, targetSpecialistId) => {
  const isSelf =
    targetSpecialistId && targetSpecialistId === authContext?.entityId;
  if (isSelf && hasPermission(authContext, [PERMISSIONS.PROFILE.UPDATE]))
    return;
  if (!hasPermission(authContext, [PERMISSIONS.SPECIALIST.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update specialists"],
    });
  }
};

const assertCanDelete = (authContext, targetSpecialistId) => {
  if (targetSpecialistId === authContext?.entityId) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Cannot delete your own specialist account"],
    });
  }
  if (!hasPermission(authContext, [PERMISSIONS.SPECIALIST.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete specialists"],
    });
  }
};

const geocodeSpecialistAddress = async (config, parts) => {
  const line = parts.filter(Boolean).join(", ");
  if (!line) return { lat: null, lon: null };
  return geocodeAddress(line, config);
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

const emitAssignmentReindex = async (config, env, assignmentIds = []) => {
  for (const assignmentId of assignmentIds) {
    if (!assignmentId) continue;
    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
      schemaVersion: "1",
      entityId: assignmentId,
      entityType: ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT,
      ENV: env,
    });
  }
};

/** Master treatment specialistCount changes when cascade toggles assignment status. */
const emitTreatmentReindexForAssignments = async (
  prisma,
  config,
  env,
  assignmentIds = [],
) => {
  const ids = [...new Set(assignmentIds)].filter(Boolean);
  if (!ids.length) return;

  const rows = await prisma.clinicSpecialistTreatment.findMany({
    where: { id: { in: ids } },
    select: { treatmentId: true },
  });

  for (const treatmentId of [...new Set(rows.map((row) => row.treatmentId))]) {
    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
      schemaVersion: "1",
      entityId: treatmentId,
      entityType: ENTITY_TYPE.TREATMENT,
      ENV: env,
    });
  }
};

const collectLinkedClinicIds = (specialist) =>
  specialist?.clinics?.map((link) => link.clinicId).filter(Boolean) ?? [];

const parseOptionalInt = (value) =>
  value != null && value !== "" && !Number.isNaN(Number(value))
    ? parseInt(value, 10)
    : null;

/**
 * Creates a specialist with Cognito user, identity profile, and clinic links.
 *
 * @param {object} ctx - Request context from `getRequestContext()`.
 */
export const createSpecialist = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const normalizedBody = normalizeSpecialistMultipartBody(
    normalizeRequest(ctx.reqBody),
  );
  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.SPECIALIST.CREATE,
    normalizedBody,
  );

  const {
    specialistImage = "",
    email = "",
    phone = "",
    age = "",
    gender,
    firstName = "",
    lastName = "",
    totalExperience = "",
    htmlAbout = "",
    overview = "",
    faqs = [],
    tags = [],
    workingHours = [],
    workingType = "",
    parentClinicId = "",
    clinicIds = [],
    instagramId = "",
    website = "",
    country = "",
    state = "",
    city = "",
    postalCode = "",
    completeAddress = "",
    available = false,
    status = "",
    perms = [],
    certificates = [],
    activeClinicId = "",
  } = reqBody;

  await assertClinicManagerCanCreateSpecialist(
    ctx.prisma,
    ctx.authContext,
    ctx.routeKey,
    {
      workingType,
      parentClinicId,
      activeClinicId,
    },
  );

  const { ok: emailOk, errors: emailErrors } = await validateSpecialistEmail(
    ctx.prisma,
    email,
  );
  if (!emailOk)
    throw httpError({ error: API_ERRORS.CONFLICT, details: emailErrors });

  const targetClinicIds =
    workingType === WORKING_TYPES.FULL_TIME
      ? [parentClinicId].filter(Boolean)
      : clinicIds;

  if (!targetClinicIds.length) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Specialist must be linked to at least one clinic"],
    });
  }

  const {
    clinics: foundClinics,
    ok: clinicOk,
    errors: clinicErrors,
  } = await getClinicsByIds(ctx.prisma, targetClinicIds);
  if (!clinicOk)
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: clinicErrors });

  const { sub } = await createCognitoSpecialistUser({
    config: ctx.config,
    email,
  });

  const { lat, lon } = await geocodeSpecialistAddress(ctx.config, [
    completeAddress,
    city,
    state,
    postalCode,
    country,
  ]);

  const mergedPerms = resolveIdentityPerms({
    requestedPerms: perms,
    granterRole: ctx.authContext?.role,
    targetRole: USER_ROLES.SPECIALIST,
    defaultPerms: ROLE_DEFAULT_GRANTS[USER_ROLES.SPECIALIST],
  });

  if (Array.isArray(perms) && perms.length > 0 && ctx.authContext?.role) {
    assertGrantRequest({
      granterRole: ctx.authContext.role,
      granterGrants: ctx.authContext?.perms?.split?.(" ") ?? [],
      targetRole: USER_ROLES.SPECIALIST,
      targetCurrentGrants: [],
      requestedGrants: mergedPerms,
    });
  }

  const profileData = {
    image: specialistImage ?? null,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    age: parseOptionalInt(age),
    gender: gender ?? null,
    totalExperience: parseOptionalInt(totalExperience),
    htmlAbout: htmlAbout ?? null,
    overview: overview ?? null,
    workingType,
    instagramId: instagramId ?? null,
    website: website ?? null,
    faqs: Array.isArray(faqs) && faqs.length ? faqs : [],
    tags: Array.isArray(tags) && tags.length ? tags : [],
    workingHours:
      Array.isArray(workingHours) && workingHours.length ? workingHours : [],
    certificates:
      Array.isArray(certificates) && certificates.length ? certificates : [],
    country: country ?? null,
    state: state ?? null,
    city: city ?? null,
    completeAddress: completeAddress ?? null,
    postalCode: postalCode ?? null,
    lat: lat ?? null,
    lon: lon ?? null,
    available,
    // Keep domain status in sync when it maps to SPECIALIST_STATUS
    ...(status &&
      status !== USER_STATUS.UNCONFIRMED && {
        status,
      }),
    entityType: ENTITY_TYPE.SPECIALIST,
    ...(workingType === WORKING_TYPES.FULL_TIME &&
      parentClinicId && {
        clinics: {
          create: {
            clinicId: parentClinicId,
            associationType: "FULL_TIME",
            isPrimary: true,
            status: "ACTIVE",
          },
        },
      }),
    ...(workingType === WORKING_TYPES.FREELANCE && {
      clinics: {
        create: foundClinics.map((clinic) => ({
          clinicId: clinic.id,
          associationType: "FREELANCE",
          isPrimary: false,
          status: "ACTIVE",
        })),
      },
    }),
  };

  const { profile: newSpecialist } = await createIdentityWithProfile(
    ctx.config.POSTGRES_DB_URL,
    {
      identity: {
        cognitoSub: sub,
        email: email.toLowerCase(),
        phone: phoneOrNA(phone),
        status: status || USER_STATUS.PENDING,
        perms: mergedPerms,
        defaultPasswordUsed: true,
        passwordSet: true,
        linkedProviders: [],
      },
      role: "SPECIALIST",
      profile: profileData,
    },
  );

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
    schemaVersion: "1",
    entityId: newSpecialist.id,
    entityType: ENTITY_TYPE.SPECIALIST,
    ENV: ctx.env,
  });

  await emitClinicReindex(ctx.config, ctx.env, targetClinicIds);

  const { specialist: hydrated } = await getSpecialistById(
    ctx.prisma,
    newSpecialist.id,
  );
  const dto = toSpecialistDto(hydrated);

  const logContext = await resolveSpecialistMutationLogContext(ctx.prisma, {
    workingType,
    parentClinicId,
    activeClinicId,
    targetClinicIds,
  });

  await logSpecialistCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    specialist: dto,
    logData: logContext,
  });

  await emitSpecialistNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.CREATED,
    ctx,
    specialist: dto,
    clinicIds: targetClinicIds,
    clinicNames: foundClinics.map((clinic) => clinic.name).filter(Boolean),
  });

  return {
    statusCode: 201,
    data: { message: "Data created successfully", success: true, item: dto },
  };
};

export const getSpecialistByIdHandler = async (ctx) => {
  const specialistId = ctx.queryParams?.id;
  if (!specialistId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid specialist ID in query params"],
    });
  }

  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { specialist, ok } = await getSpecialistById(ctx.prisma, specialistId);

  if (
    ok &&
    ctx.queryParams?.from &&
    ["search", "listing"].includes(ctx.queryParams.from)
  ) {
    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SEARCH_CLICK, {
      schemaVersion: "1",
      entityId: specialistId,
      entityType: ENTITY_TYPE.ENTITY_SEARCH_STATS,
      ENV: ctx.env,
      searchStats: {
        targetEntityType: ENTITY_TYPE.SPECIALIST,
        targetEntityId: specialistId,
        source: ctx.queryParams.from,
      },
    });
  }

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toSpecialistDto(specialist) : null,
      success: true,
    },
  };
};

export const listSpecialists = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.SPECIALIST.LIST,
    normalizeRequest(ctx.reqBody),
  );
  await resolveSpecialistListFilters(ctx, query, {
    isManagementRoute: isManagementRoute(ctx.routeKey),
  });

  const indexAlias = `specialists-${ctx.env}`;
  const allRecords = await searchSpecialists({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map(toSpecialistDto),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: true,
    },
  };
};

export const listSpecialistsByTreatmentId = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.SPECIALIST.GET_BY_TREATMENT,
    normalizeRequest(ctx.reqBody),
  );

  await resolveSpecialistListFilters(ctx, query, {
    isManagementRoute: isManagementRoute(ctx.routeKey),
  });

  const { items, total, nextToken } = await searchSpecialists({
    opsClient: ctx.opsClient,
    query,
    indexAlias: `specialists-${ctx.env}`,
  });

  return {
    statusCode: 200,
    data: {
      ...(!items.length ? { message: "No data found" } : {}),
      items: items.map(toSpecialistDto),
      total,
      nextToken: nextToken ?? null,
      success: true,
    },
  };
};

export const updateSpecialist = async (ctx) => {
  const normalizedBody = normalizeSpecialistMultipartBody(
    normalizeRequest(ctx.reqBody),
  );
  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.SPECIALIST.UPDATE,
    normalizedBody,
  );

  const {
    id,
    firstName,
    lastName,
    phone,
    workingType,
    available,
    status,
    clinicIds,
    parentClinicId,
    specialistImage,
    age,
    gender,
    totalExperience,
    htmlAbout,
    overview,
    faqs,
    tags,
    workingHours,
    instagramId,
    website,
    country,
    state,
    city,
    postalCode,
    completeAddress,
    certificates,
    activeClinicId,
    perms,
  } = reqBody;

  assertCanUpdate(ctx.authContext, id);

  const isSelfUpdate = id === ctx.authContext?.entityId;

  const {
    specialist: foundSpecialist,
    ok,
    errors,
  } = await getSpecialistById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  await assertClinicManagerCanUpdateSpecialist(
    ctx.prisma,
    ctx.authContext,
    ctx.routeKey,
    {
      specialist: foundSpecialist,
      parentClinicId,
      activeClinicId,
      clinicIds,
    },
  );

  if (
    workingType &&
    foundSpecialist.workingType &&
    workingType !== foundSpecialist.workingType
  ) {
    throw httpError({
      error: API_ERRORS.CONFLICT,
      details: ["workingType cannot be changed after specialist creation"],
    });
  }

  const effectiveWorkingType = workingType || foundSpecialist.workingType;
  const targetClinicIds =
    effectiveWorkingType === WORKING_TYPES.FULL_TIME
      ? [parentClinicId].filter(Boolean)
      : (clinicIds ?? []);

  let foundClinics = [];
  if (targetClinicIds.length) {
    const clinicResult = await getClinicsByIds(ctx.prisma, targetClinicIds);
    if (!clinicResult.ok) {
      throw httpError({
        error: API_ERRORS.NOT_FOUND,
        details: clinicResult.errors,
      });
    }
    foundClinics = clinicResult.clinics;
  }

  const previousClinicIds = collectLinkedClinicIds(foundSpecialist);

  let lat = foundSpecialist.lat;
  let lon = foundSpecialist.lon;
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
      const geocoded = await geocodeSpecialistAddress(ctx.config, parts);
      lat = geocoded.lat ?? null;
      lon = geocoded.lon ?? null;
    } else {
      lat = null;
      lon = null;
    }
  }

  const updateData = {
    ...(specialistImage !== undefined && { image: specialistImage || null }),
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(firstName !== undefined || lastName !== undefined
      ? {
          fullName: `${firstName ?? foundSpecialist.firstName} ${
            lastName ?? foundSpecialist.lastName
          }`.trim(),
        }
      : {}),
    ...("age" in reqBody && {
      age:
        age != null && age !== "" && !Number.isNaN(Number(age))
          ? parseInt(age, 10)
          : null,
    }),
    ...("gender" in reqBody && { gender: gender || null }),
    ...("totalExperience" in reqBody && {
      totalExperience:
        totalExperience != null &&
        totalExperience !== "" &&
        !Number.isNaN(Number(totalExperience))
          ? parseInt(totalExperience, 10)
          : null,
    }),
    ...(htmlAbout !== undefined && { htmlAbout: htmlAbout || null }),
    ...(overview !== undefined && { overview: overview || null }),
    ...("faqs" in reqBody && { faqs: faqs?.length ? faqs : [] }),
    ...("tags" in reqBody && { tags: tags?.length ? tags : [] }),
    ...("workingHours" in reqBody && {
      workingHours: workingHours?.length ? workingHours : [],
    }),
    ...("certificates" in reqBody && {
      certificates: certificates?.length ? certificates : [],
    }),
    ...(instagramId !== undefined && { instagramId: instagramId || null }),
    ...(website !== undefined && { website: website || null }),
    ...(country !== undefined && { country: country || null }),
    ...(state !== undefined && { state: state || null }),
    ...(city !== undefined && { city: city || null }),
    ...(completeAddress !== undefined && {
      completeAddress: completeAddress || null,
    }),
    ...(postalCode !== undefined && { postalCode: postalCode || null }),
    ...(locationProvided && { lat, lon }),
    ...(available !== undefined && { available }),
    // Domain status enum has no UNCONFIRMED — identity holds auth status.
    ...(status !== undefined &&
      status !== USER_STATUS.UNCONFIRMED && { status }),
  };

  let cascadeResult = null;
  let resolvedTargetClinicIds = [];
  let shouldSyncClinicLinks = false;

  if (effectiveWorkingType === WORKING_TYPES.FULL_TIME) {
    const parentId =
      foundClinics[0]?.id ?? parentClinicId ?? previousClinicIds[0] ?? null;
    if (!parentId) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: [
          "Full-time specialist requires parentClinicId or an existing primary clinic link",
        ],
      });
    }
    resolvedTargetClinicIds = [parentId];
    shouldSyncClinicLinks = true;
  } else if (
    effectiveWorkingType === WORKING_TYPES.FREELANCE &&
    Array.isArray(clinicIds)
  ) {
    if (!targetClinicIds.length) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: ["Specialist must be linked to at least one clinic"],
      });
    }
    resolvedTargetClinicIds = foundClinics.map((clinic) => clinic.id);
    shouldSyncClinicLinks = true;
  }

  let updatedSpecialist;
  if (shouldSyncClinicLinks) {
    updatedSpecialist = await ctx.prisma.$transaction(async (tx) => {
      cascadeResult = await syncSpecialistClinicLinksInTx(tx, {
        specialistId: foundSpecialist.id,
        workingType: effectiveWorkingType,
        targetClinicIds: resolvedTargetClinicIds,
      });

      return tx.specialist.update({
        where: { id: foundSpecialist.id },
        data: updateData,
      });
    });
  } else {
    updatedSpecialist = await ctx.prisma.specialist.update({
      where: { id: foundSpecialist.id },
      data: updateData,
    });
  }

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
        currentPerms: foundSpecialist.identity?.perms ?? [],
        authContext: ctx.authContext,
      })
    ) {
      const resolvedPerms = resolveIdentityPerms({
        requestedPerms: perms,
        granterRole: ctx.authContext?.role,
        targetRole: USER_ROLES.SPECIALIST,
        defaultPerms: ROLE_DEFAULT_GRANTS[USER_ROLES.SPECIALIST],
      });
      assertGrantRequest({
        granterRole: ctx.authContext?.role ?? "",
        granterGrants: ctx.authContext?.perms?.split?.(" ") ?? [],
        targetRole: USER_ROLES.SPECIALIST,
        targetCurrentGrants: foundSpecialist.identity?.perms ?? [],
        requestedGrants: resolvedPerms,
      });
      identityUpdates.perms = resolvedPerms;
    }

    if (Object.keys(identityUpdates).length > 0) {
      await updateIdentity(
        ctx.config.POSTGRES_DB_URL,
        foundSpecialist.identityId,
        identityUpdates,
      );
    }

    appliedIdentityUpdates = identityUpdates;
  }

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: updatedSpecialist.id,
    entityType: ENTITY_TYPE.SPECIALIST,
    ENV: ctx.env,
  });

  const nextClinicIds = shouldSyncClinicLinks
    ? resolvedTargetClinicIds
    : previousClinicIds;

  const affectedAssignmentIds = cascadeResult
    ? [
        ...new Set([
          ...cascadeResult.deactivatedAssignmentIds,
          ...cascadeResult.reactivatedAssignmentIds,
        ]),
      ]
    : [];

  // Clinic roster sync only — profile-only updates skip this block.
  if (affectedAssignmentIds.length > 0) {
    await emitAssignmentReindex(ctx.config, ctx.env, affectedAssignmentIds);
    await emitTreatmentReindexForAssignments(
      ctx.prisma,
      ctx.config,
      ctx.env,
      affectedAssignmentIds,
    );
  }

  if (shouldSyncClinicLinks) {
    await emitClinicReindex(ctx.config, ctx.env, [
      ...new Set([
        ...previousClinicIds,
        ...nextClinicIds,
        ...(cascadeResult?.leftClinicIds ?? []),
        ...(cascadeResult?.joinedClinicIds ?? []),
      ]),
    ]);
  }

  const { specialist: hydrated } = await getSpecialistById(
    ctx.prisma,
    updatedSpecialist.id,
  );
  const dto = toSpecialistDto(hydrated);

  const logContext = await resolveSpecialistMutationLogContext(ctx.prisma, {
    workingType: effectiveWorkingType,
    parentClinicId,
    activeClinicId,
    targetClinicIds: nextClinicIds,
  });

  await logSpecialistUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    specialist: dto,
    logData: { ...updateData, ...logContext },
  });

  await emitSpecialistNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    specialist: dto,
    previousClinicIds,
    ...(shouldSyncClinicLinks ? { clinicIds: nextClinicIds } : {}),
    isSelfUpdate,
    identityUpdates: appliedIdentityUpdates,
    profileUpdated: Object.keys(updateData).length > 0,
  });

  return {
    statusCode: 200,
    data: { message: "Data updated successfully", success: true, item: dto },
  };
};

export const deleteSpecialist = async (ctx) => {
  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Specialist ID is required"],
    });
  }

  assertCanDelete(ctx.authContext, id);

  const { specialist, ok, errors } = await getSpecialistById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toSpecialistDto(specialist);
  const linkedClinicIds = collectLinkedClinicIds(specialist);

  await removeProfile(ctx.config.POSTGRES_DB_URL, specialist.identityId);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: specialist.id,
    entityType: ENTITY_TYPE.SPECIALIST,
    ENV: ctx.env,
  });

  await emitClinicReindex(ctx.config, ctx.env, linkedClinicIds);

  const logContext = await resolveSpecialistMutationLogContext(ctx.prisma, {
    workingType: specialist.workingType,
    targetClinicIds: linkedClinicIds,
  });

  await logSpecialistDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    specialist: dtoBefore,
    logData: logContext,
  });

  await emitSpecialistNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    specialist: dtoBefore,
  });

  return {
    statusCode: 200,
    data: { message: "Data deleted successfully", success: true },
  };
};

export const getTopSearchedSpecialists = async (ctx) => {
  const allowZeroSearchClicks =
    ctx.queryParams?.allowZeroSearchClicks === true ||
    ctx.queryParams?.allowZeroSearchClicks === "true" ||
    ctx.queryParams?.allowZeroSearchClicks === "1";

  const query = {
    pagination: { limit: ctx.queryParams?.limit ?? 10 },
    sort: { by: "searchClicks", order: "desc" },
    filters: {
      ...(allowZeroSearchClicks ? { allowZeroSearchClicks: true } : {}),
    },
  };

  const indexAlias = `specialists-${ctx.env}`;
  const allRecords = await searchSpecialists({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map(toSpecialistDto),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: true,
    },
  };
};
