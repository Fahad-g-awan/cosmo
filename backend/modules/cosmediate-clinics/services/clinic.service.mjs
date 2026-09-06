import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { phoneOrNA } from "/opt/nodejs/utils/formatting/phone.mjs";
import {
  CLINIC_STATUS,
  CLINIC_TYPES,
} from "/opt/nodejs/constants/domain/clinic.constants.mjs";
import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import {
  emitClinicNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { geocodeAddress } from "/opt/nodejs/lib/location/geocode.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { getClinicById, validateClinicEmail } from "./clinic.repository.mjs";
import { getCategoriesByIds } from "./clinic-category.repository.mjs";
import { searchClinics } from "./clinic-search.service.mjs";
import {
  logClinicCreate,
  logClinicDelete,
  logClinicUpdate,
} from "./clinic-compliance.service.mjs";
import { toClinicDetailDto, toClinicListItemDto } from "../lib/clinic-dto.mjs";
import { normalizeClinicMultipartBody } from "../lib/clinic-request.mjs";
import { isManagementRoute } from "../lib/route-scope.mjs";
import {
  assertManagersInClinicOrg,
  resolveManagerOrgRootId,
} from "./manager-org.mjs";
import {
  getManagersByIds,
  validateManagerEmail,
} from "./manager.repository.mjs";
import { createManager } from "./manager.service.mjs";

/**
 * Hard-deletes a just-created clinic after inline manager bootstrap fails.
 * Cascade removes category/manager links. Emits DELETE so search stays consistent
 * if an INSERT was already published.
 *
 * @param {object} ctx
 * @param {{ id: string }} clinic
 */
const rollbackFreshClinicCreate = async (ctx, clinic) => {
  if (!clinic?.id) return;

  try {
    await ctx.prisma.clinic.delete({ where: { id: clinic.id } });
  } catch (error) {
    console.error(
      "[createClinic] Failed to hard-delete clinic after manager failure:",
      clinic.id,
      error,
    );
  }

  try {
    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.DELETE, {
      schemaVersion: "1",
      entityId: clinic.id,
      entityType: ENTITY_TYPE.CLINIC,
      ENV: ctx.env,
    });
  } catch (error) {
    console.error(
      "[createClinic] Failed to emit DELETE after clinic rollback:",
      clinic.id,
      error,
    );
  }
};

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create clinics"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view clinics"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update clinics"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete clinics"],
    });
  }
};

const geocodeClinicAddress = async (config, parts) => {
  const line = parts.filter(Boolean).join(", ");
  if (!line) return { lat: null, lon: null };
  return geocodeAddress(line, config);
};

const emitEntityUpdates = async (config, env, entityType, ids) => {
  for (const entityId of ids) {
    if (!entityId) continue;
    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
      schemaVersion: "1",
      entityId,
      entityType,
      ENV: env,
    });
  }
};

export const createClinic = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const normalizedBody = normalizeClinicMultipartBody(
    normalizeRequest(ctx.reqBody),
  );
  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.CLINIC.CREATE,
    normalizedBody,
  );

  const {
    clinicType,
    parentClinicId,
    email = "",
    name = "",
    phone = "",
    clinicAge = "",
    clinicLogo = "",
    htmlAbout = "",
    overview = "",
    categories = [],
    faqs = [],
    tags = [],
    workingHours = [],
    certificates = [],
    instagramId = "",
    website = "",
    country = "",
    state = "",
    city = "",
    postalCode = "",
    completeAddress = "",
    status = "",
    available = false,
    managerIds = [],
    managerEmail,
    managerPhone,
    managerFirstName,
    managerLastName,
    managerGender,
    managerAge,
    managerStatus,
    managerCountry,
    managerState,
    managerCity,
    managerPostalCode,
    managerCompleteAddress,
    managerPerms = [],
  } = reqBody;

  const clinicImages = normalizedBody.clinicImages ?? [];

  const emailConflictErrors = [];

  const { ok: emailOk, errors: emailErrors } = await validateClinicEmail(
    ctx.prisma,
    email,
  );
  if (!emailOk) emailConflictErrors.push(...emailErrors);

  if (clinicType === CLINIC_TYPES.NODE) {
    const { ok, errors } = await getClinicById(ctx.prisma, parentClinicId);
    if (!ok) throw httpError({ error: API_ERRORS.CONFLICT, details: errors });
  }

  if (categories?.length) {
    const { ok, errors } = await getCategoriesByIds(ctx.prisma, categories);
    if (!ok) throw httpError({ error: API_ERRORS.CONFLICT, details: errors });
  }

  if (managerIds.length) {
    const { ok, errors } = await getManagersByIds(ctx.prisma, managerIds);
    if (!ok) throw httpError({ error: API_ERRORS.CONFLICT, details: errors });

    if (clinicType === CLINIC_TYPES.NODE) {
      await assertManagersInClinicOrg(ctx.prisma, managerIds, parentClinicId);
    } else {
      const offenders = [];
      for (const managerId of managerIds) {
        const root = await resolveManagerOrgRootId(ctx.prisma, managerId);
        if (root) offenders.push(managerId);
      }
      if (offenders.length) {
        throw httpError({
          error: API_ERRORS.BAD_REQUEST,
          details: [
            "A new PARENT clinic can only attach brand-new managers (no existing org)",
            `Pre-existing managers cannot be moved across organizations: ${offenders.join(", ")}`,
          ],
        });
      }
    }
  }

  const shouldCreateInlineManager =
    !managerIds.length &&
    managerEmail &&
    managerFirstName &&
    managerLastName;

  if (shouldCreateInlineManager) {
    const { ok: managerEmailOk, errors: managerEmailErrors } =
      await validateManagerEmail(ctx.prisma, managerEmail);
    if (!managerEmailOk) {
      const managerConflictMessage =
        clinicType === CLINIC_TYPES.NODE
          ? "A manager account with this email already exists. Please select an existing manager or use a different email address."
          : (managerEmailErrors[0] ??
            "A manager account with this email already exists. Please use a different email address.");
      emailConflictErrors.push(managerConflictMessage);
    }
  }

  if (emailConflictErrors.length) {
    throw httpError({
      error: API_ERRORS.CONFLICT,
      details: emailConflictErrors,
    });
  }

  const { lat, lon } = await geocodeClinicAddress(ctx.config, [
    completeAddress,
    city,
    state,
    postalCode,
    country,
  ]);

  const newClinic = await ctx.prisma.clinic.create({
    data: {
      entityType: ENTITY_TYPE.CLINIC,
      logo: clinicLogo ?? null,
      email,
      name: name.toLowerCase(),
      phone: phoneOrNA(phone),
      clinicAge: clinicAge ?? null,
      clinicType,
      htmlAbout: htmlAbout || null,
      overview: overview || null,
      images:
        Array.isArray(clinicImages) && clinicImages.length ? clinicImages : [],
      faqs: Array.isArray(faqs) && faqs.length ? faqs : [],
      tags: Array.isArray(tags) && tags.length ? tags : [],
      workingHours:
        Array.isArray(workingHours) && workingHours.length ? workingHours : [],
      certificates:
        Array.isArray(certificates) && certificates.length ? certificates : [],
      instagramId: instagramId ?? null,
      website: website ?? null,
      country: country || null,
      state: state || null,
      city: city || null,
      completeAddress: completeAddress || null,
      postalCode: postalCode || null,
      lat: lat ?? null,
      lon: lon ?? null,
      ...(parentClinicId && { parentClinicId }),
      status: status || CLINIC_STATUS.PENDING,
      available,
      categories: {
        create: categories.map((categoryId) => ({ categoryId })),
      },
      ...(managerIds.length && {
        managers: { create: managerIds.map((managerId) => ({ managerId })) },
      }),
    },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
    schemaVersion: "1",
    entityId: newClinic.id,
    entityType: ENTITY_TYPE.CLINIC,
    ENV: ctx.env,
  });

  let newManager = null;

  if (shouldCreateInlineManager) {
    try {
      const createManagerResponse = await createManager(ctx, {
        managerData: {
          clinicIds: [newClinic.id],
          email: managerEmail,
          phone: phoneOrNA(managerPhone),
          firstName: managerFirstName,
          lastName: managerLastName,
          status: managerStatus || USER_STATUS.ACTIVE,
          ...(managerGender !== undefined &&
            managerGender !== "" && { gender: managerGender }),
          ...(managerAge !== undefined &&
            managerAge !== "" &&
            !Number.isNaN(Number(managerAge)) && { age: managerAge }),
          ...(managerCountry && { country: managerCountry }),
          ...(managerState && { state: managerState }),
          ...(managerCity && { city: managerCity }),
          ...(managerPostalCode && { postalCode: managerPostalCode }),
          ...(managerCompleteAddress && {
            completeAddress: managerCompleteAddress,
          }),
          ...(Array.isArray(managerPerms) &&
            managerPerms.length > 0 && { perms: managerPerms }),
        },
        localInvoke: true,
      });
      newManager = createManagerResponse.data?.item ?? null;
    } catch (error) {
      await rollbackFreshClinicCreate(ctx, newClinic);
      throw error;
    }
  }

  await emitEntityUpdates(
    ctx.config,
    ctx.env,
    ENTITY_TYPE.CLINIC_CATEGORY,
    categories,
  );
  if (managerIds.length) {
    await emitEntityUpdates(
      ctx.config,
      ctx.env,
      ENTITY_TYPE.CLINIC_MANAGER,
      managerIds,
    );
  }

  await logClinicCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    clinic: newClinic,
  });

  await emitClinicNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.CREATED,
    ctx,
    clinic: newClinic,
    managerIds: managerIds.length ? managerIds : [],
  });

  return {
    statusCode: 201,
    data: {
      message: "Data created successfully",
      success: true,
      item: newClinic,
      manager: newManager ?? managerIds,
    },
  };
};

export const getClinicByIdHandler = async (ctx) => {
  const clinicId = ctx.queryParams?.id;
  const from = ctx.queryParams?.from ?? null;

  if (!clinicId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid clinic ID in query params"],
    });
  }

  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { clinic, ok } = await getClinicById(ctx.prisma, clinicId);

  if (ok && from && ["search", "listing"].includes(from)) {
    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SEARCH_CLICK, {
      schemaVersion: "1",
      entityId: clinicId,
      entityType: ENTITY_TYPE.ENTITY_SEARCH_STATS,
      ENV: ctx.env,
      searchStats: {
        targetEntityType: ENTITY_TYPE.CLINIC,
        targetEntityId: clinicId,
        source: from,
      },
    });
  }

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toClinicDetailDto(clinic) : null,
      success: ok,
    },
  };
};

export const listClinics = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.CLINIC.LIST,
    normalizeRequest(ctx.reqBody),
  );
  const indexAlias = `clinics-${ctx.env}`;
  const allRecords = await searchClinics({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map(toClinicListItemDto),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const updateClinic = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const normalizedBody = normalizeClinicMultipartBody(
    normalizeRequest(ctx.reqBody),
  );
  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.CLINIC.UPDATE,
    normalizedBody,
  );

  const {
    id,
    clinicType,
    parentClinicId,
    managerIds = [],
    name,
    phone,
    status,
    available,
    clinicAge,
    clinicLogo,
    htmlAbout,
    overview,
    categories,
    faqs,
    tags,
    workingHours,
    certificates,
    instagramId,
    website,
    country,
    state,
    city,
    postalCode,
    completeAddress,
  } = reqBody;

  const clinicImages = normalizedBody.clinicImages;

  const {
    clinic: foundClinic,
    ok: clinicOk,
    errors: clinicErrors,
  } = await getClinicById(ctx.prisma, id);
  if (!clinicOk)
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: clinicErrors });

  if (
    clinicType !== undefined &&
    clinicType !== foundClinic.clinicType
  ) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Clinic type cannot be changed"],
    });
  }

  const previousCategoryIds =
    foundClinic.categories?.map((link) => link.categoryId) ?? [];
  const previousManagerIds =
    foundClinic.managers?.map((link) => link.managerId) ?? [];

  if (clinicType === CLINIC_TYPES.NODE) {
    const { ok, errors } = await getClinicById(ctx.prisma, parentClinicId);
    if (!ok) throw httpError({ error: API_ERRORS.CONFLICT, details: errors });
  }

  if ("categories" in reqBody && categories?.length) {
    const { ok: categoriesOk, errors: categoriesErrors } =
      await getCategoriesByIds(ctx.prisma, categories);
    if (!categoriesOk) {
      throw httpError({
        error: API_ERRORS.CONFLICT,
        details: categoriesErrors,
      });
    }
  }

  if (managerIds.length) {
    const { ok, errors } = await getManagersByIds(ctx.prisma, managerIds);
    if (!ok) throw httpError({ error: API_ERRORS.CONFLICT, details: errors });
    await assertManagersInClinicOrg(ctx.prisma, managerIds, foundClinic.id);
  }

  let lat = foundClinic.lat;
  let lon = foundClinic.lon;
  const nextCountry = "country" in reqBody ? country : foundClinic.country;
  const nextState = "state" in reqBody ? state : foundClinic.state;
  const nextCity = "city" in reqBody ? city : foundClinic.city;
  const nextPostalCode =
    "postalCode" in reqBody ? postalCode : foundClinic.postalCode;
  const nextCompleteAddress =
    "completeAddress" in reqBody
      ? completeAddress
      : foundClinic.completeAddress;

  const addressChanged =
    nextCountry !== foundClinic.country ||
    nextState !== foundClinic.state ||
    nextCity !== foundClinic.city ||
    nextPostalCode !== foundClinic.postalCode ||
    nextCompleteAddress !== foundClinic.completeAddress;

  if (addressChanged) {
    const geocoded = await geocodeClinicAddress(ctx.config, [
      nextCompleteAddress,
      nextCity,
      nextState,
      nextPostalCode,
      nextCountry,
    ]);
    lat = geocoded.lat;
    lon = geocoded.lon;
  }

  const updateData = {
    ...("clinicLogo" in reqBody && { logo: clinicLogo || null }),
    ...(name !== undefined && { name }),
    ...(phone !== undefined && { phone: phoneOrNA(phone) }),
    ...("clinicAge" in reqBody && { clinicAge: clinicAge || null }),
    // Clinic type is immutable after create — validated above; do not update.
    // ...(clinicType !== undefined && { clinicType }),
    ...(parentClinicId !== undefined && {
      parentClinicId: parentClinicId || null,
    }),
    ...("htmlAbout" in reqBody && { htmlAbout: htmlAbout || null }),
    ...("overview" in reqBody && { overview: overview || null }),
    ...("faqs" in reqBody && { faqs: faqs?.length ? faqs : [] }),
    ...("tags" in reqBody && { tags: tags?.length ? tags : [] }),
    ...("workingHours" in reqBody && {
      workingHours: workingHours?.length ? workingHours : [],
    }),
    ...("certificates" in reqBody && {
      certificates: certificates?.length ? certificates : [],
    }),
    ...(clinicImages !== undefined && {
      images: clinicImages.length ? clinicImages : [],
    }),
    ...("instagramId" in reqBody && { instagramId: instagramId || null }),
    ...("website" in reqBody && { website: website || null }),
    ...("country" in reqBody && { country: country || null }),
    ...("state" in reqBody && { state: state || null }),
    ...("city" in reqBody && { city: city || null }),
    ...("completeAddress" in reqBody && {
      completeAddress: completeAddress || null,
    }),
    ...("postalCode" in reqBody && { postalCode: postalCode || null }),
    ...(addressChanged && { lat, lon }),
    ...(status !== undefined && { status }),
    ...(available !== undefined && { available }),
    ...("categories" in reqBody &&
      categories?.length > 0 && {
        categories: {
          deleteMany: {},
          create: categories.map((categoryId) => ({ categoryId })),
        },
      }),
    ...(managerIds !== undefined &&
      managerIds.length > 0 && {
        managers: {
          deleteMany: {},
          create: managerIds.map((managerId) => ({ managerId })),
        },
      }),
  };

  const updatedClinic = await ctx.prisma.clinic.update({
    where: { id: foundClinic.id },
    data: updateData,
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: updatedClinic.id,
    entityType: ENTITY_TYPE.CLINIC,
    ENV: ctx.env,
  });

  if (categories !== undefined) {
    const affectedCategoryIds = [
      ...new Set([...previousCategoryIds, ...categories]),
    ];
    await emitEntityUpdates(
      ctx.config,
      ctx.env,
      ENTITY_TYPE.CLINIC_CATEGORY,
      affectedCategoryIds,
    );
  }

  if (managerIds !== undefined) {
    const affectedManagerIds = [
      ...new Set([...previousManagerIds, ...managerIds]),
    ];
    await emitEntityUpdates(
      ctx.config,
      ctx.env,
      ENTITY_TYPE.CLINIC_MANAGER,
      affectedManagerIds,
    );
  }

  await logClinicUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    clinic: updatedClinic,
    logData: updateData,
  });

  await emitClinicNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    clinic: updatedClinic,
    previousManagerIds,
    ...(Array.isArray(reqBody.managerIds) && reqBody.managerIds.length > 0
      ? { managerIds: reqBody.managerIds }
      : {}),
  });

  return {
    statusCode: 200,
    data: {
      message: "Data updated successfully",
      item: updatedClinic,
      success: true,
    },
  };
};

export const deleteClinic = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Clinic ID is required"],
    });
  }

  const { clinic, ok, errors } = await getClinicById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toClinicDetailDto(clinic);
  const deletedAt = new Date();

  await ctx.prisma.clinic.update({
    where: { id: clinic.id },
    data: { deleted: true, deletedAt },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: clinic.id,
    entityType: ENTITY_TYPE.CLINIC,
    ENV: ctx.env,
  });

  const categoryIds =
    clinic.categories?.map((link) => link.categoryId).filter(Boolean) ?? [];
  await emitEntityUpdates(
    ctx.config,
    ctx.env,
    ENTITY_TYPE.CLINIC_CATEGORY,
    categoryIds,
  );

  await logClinicDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    clinic: dtoBefore,
  });

  await emitClinicNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    clinic: dtoBefore,
  });

  return {
    statusCode: 200,
    data: { message: "Data deleted successfully", success: true },
  };
};

export const listClinicsByTreatmentId = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: rawQuery } = validateRequestBody(
    CRUD_ACTIONS.CLINIC.GET_BY_TREATMENT,
    normalizeRequest(ctx.reqBody),
  );

  const treatmentId =
    rawQuery.filters?.treatmentId ?? rawQuery.treatmentId ?? null;

  if (!treatmentId) {
    return {
      statusCode: 400,
      data: {
        message: "Treatment ID is required in filters",
        success: false,
        items: [],
        total: 0,
        nextToken: null,
      },
    };
  }

  const query = {
    ...rawQuery,
    filters: {
      ...(rawQuery.filters ?? {}),
      treatmentId,
    },
  };
  delete query.treatmentId;

  const { items, total, nextToken } = await searchClinics({
    opsClient: ctx.opsClient,
    query,
    indexAlias: `clinics-${ctx.env}`,
  });

  return {
    statusCode: 200,
    data: {
      ...(!items.length ? { message: "No data found" } : {}),
      items: items.map(toClinicListItemDto),
      total,
      nextToken: nextToken ?? null,
      success: items.length > 0,
    },
  };
};

export const listPopularClinics = async (ctx) => {
  const allowZeroRating =
    ctx.queryParams?.allowZeroRating === true ||
    ctx.queryParams?.allowZeroRating === "true" ||
    ctx.queryParams?.allowZeroRating === "1";

  const query = {
    pagination: { limit: ctx.queryParams?.limit ?? 10 },
    sort: { by: "popular", order: "desc" },
    filters: {
      ...(allowZeroRating ? { allowZeroRating: true } : {}),
    },
  };
  const indexAlias = `clinics-${ctx.env}`;
  const allRecords = await searchClinics({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map(toClinicListItemDto),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const listTopSearchedClinics = async (ctx) => {
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
  const indexAlias = `clinics-${ctx.env}`;
  const allRecords = await searchClinics({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map(toClinicListItemDto),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};
