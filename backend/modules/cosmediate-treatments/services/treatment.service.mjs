import {
  emitTreatmentNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { resolvePersonDisplayName } from "/opt/nodejs/services/dynamodb/activity-feed.utils.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  logTreatmentCreate,
  logTreatmentDelete,
  logTreatmentUpdate,
} from "./treatment-compliance.service.mjs";
import {
  getPublishedTreatmentById,
  getTreatmentById,
} from "./treatment.repository.mjs";
import {
  isManagementRoute,
  resolveTreatmentListFilters,
  shouldOmitTreatmentRichContent,
} from "../lib/route-scope.mjs";
import { cascadeTreatmentDenormFields } from "../lib/treatment-denorm-cascade.mjs";
import { getCategoryById } from "./treatment-category.repository.mjs";
import { searchTreatments } from "./treatment-search.service.mjs";
import { toTreatmentDto } from "../lib/treatment-dto.mjs";

const authorFromContext = (authContext) => ({
  authorId: authContext?.entityId ?? "",
  authorName:
    resolvePersonDisplayName({
      fullName: authContext?.fullName,
      firstName: authContext?.firstName,
      lastName: authContext?.lastName,
    }) ||
    authContext?.email ||
    "",
  authorEmail: authContext?.email ?? "",
});

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create treatments"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view treatments"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update treatments"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete treatments"],
    });
  }
};

const mapTreatmentItem = (item, routeKey) =>
  toTreatmentDto(item, {
    omitRichFields: shouldOmitTreatmentRichContent(routeKey),
  });

export const createTreatment = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const {
    categoryId,
    treatmentImage = "",
    name = "",
    htmlDescription = "",
    overview = "",
    recoveryTime = "",
    anesthesia = "",
    faqs = [],
    tags = [],
    published = false,
  } = reqBody;

  const { ok: categoryOk, errors: categoryErrors } = await getCategoryById(
    ctx.prisma,
    categoryId,
  );
  if (!categoryOk) {
    throw httpError({ error: API_ERRORS.BAD_REQUEST, details: categoryErrors });
  }

  const author = authorFromContext(ctx.authContext);

  const newTreatment = await ctx.prisma.treatment.create({
    data: {
      name: name.toLowerCase(),
      image: treatmentImage || null,
      htmlDescription: htmlDescription || null,
      overview: overview || null,
      recoveryTime: recoveryTime || null,
      anesthesia: anesthesia || null,
      faqs: Array.isArray(faqs) && faqs.length ? faqs : [],
      tags: Array.isArray(tags) && tags.length ? tags : [],
      published,
      categoryId,
      entityType: ENTITY_TYPE.TREATMENT,
      ...author,
    },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
    schemaVersion: "1",
    entityId: newTreatment.id,
    entityType: ENTITY_TYPE.TREATMENT,
    ENV: ctx.env,
    commands: { updateTreatmentCountOnCategory: true },
  });

  const dto = toTreatmentDto(newTreatment);

  await logTreatmentCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    treatment: dto,
  });

  await emitTreatmentNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.CREATED,
    ctx,
    entityType: "treatment",
    entity: dto,
  });

  return {
    statusCode: 201,
    data: { message: "Data created successfully", success: true, item: dto },
  };
};

export const getTreatmentByIdHandler = async (ctx) => {
  const treatmentId = ctx.queryParams?.id;
  if (!treatmentId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid treatment ID in query params"],
    });
  }

  const management = isManagementRoute(ctx.routeKey);
  if (management) {
    assertCanRead(ctx.authContext);
  }

  const loader = management ? getTreatmentById : getPublishedTreatmentById;

  const { treatment, ok } = await loader(ctx.prisma, treatmentId);

  if (
    ok &&
    ctx.queryParams?.from &&
    ["search", "listing"].includes(ctx.queryParams.from)
  ) {
    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SEARCH_CLICK, {
      schemaVersion: "1",
      entityId: treatmentId,
      entityType: ENTITY_TYPE.ENTITY_SEARCH_STATS,
      ENV: ctx.env,
      searchStats: {
        targetEntityType: ENTITY_TYPE.TREATMENT,
        targetEntityId: treatmentId,
        source: ctx.queryParams.from,
      },
    });
  }

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toTreatmentDto(treatment) : null,
      success: ok,
    },
  };
};

export const listTreatments = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT.LIST,
    normalizeRequest(ctx.reqBody),
  );
  const filters = resolveTreatmentListFilters(
    ctx.routeKey,
    query.filters ?? {},
  );
  const scopedQuery = { ...query, filters };

  const indexAlias = `treatments-${ctx.env}`;
  const allRecords = await searchTreatments({
    opsClient: ctx.opsClient,
    query: scopedQuery,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map((item) =>
        mapTreatmentItem(item, ctx.routeKey),
      ),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const getTopSearchedTreatments = async (ctx) => {
  const allowZeroSearchClicks =
    ctx.queryParams?.allowZeroSearchClicks === true ||
    ctx.queryParams?.allowZeroSearchClicks === "true" ||
    ctx.queryParams?.allowZeroSearchClicks === "1";

  const query = {
    pagination: { limit: ctx.queryParams?.limit ?? 10 },
    sort: { by: "searchClicks", order: "desc" },
    filters: {
      ...resolveTreatmentListFilters(ctx.routeKey, {}),
      ...(allowZeroSearchClicks ? { allowZeroSearchClicks: true } : {}),
    },
  };

  const indexAlias = `treatments-${ctx.env}`;
  const allRecords = await searchTreatments({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map((item) =>
        mapTreatmentItem(item, ctx.routeKey),
      ),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const updateTreatment = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const {
    id,
    categoryId,
    treatmentImage,
    name,
    htmlDescription,
    overview,
    recoveryTime,
    anesthesia,
    faqs,
    tags,
    published,
  } = reqBody;

  if (categoryId) {
    const { ok: categoryOk, errors: categoryErrors } = await getCategoryById(
      ctx.prisma,
      categoryId,
    );
    if (!categoryOk) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: categoryErrors,
      });
    }
  }

  const { ok: treatmentOk, errors: treatmentErrors } = await getTreatmentById(
    ctx.prisma,
    id,
  );
  if (!treatmentOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: treatmentErrors });
  }

  const updateData = {
    ...(name !== undefined && name !== "" && { name: name.toLowerCase() }),
    ...(treatmentImage !== undefined && { image: treatmentImage || null }),
    ...(htmlDescription !== undefined && {
      htmlDescription: htmlDescription || null,
    }),
    ...(overview !== undefined && { overview: overview || null }),
    ...(recoveryTime !== undefined && { recoveryTime: recoveryTime || null }),
    ...(anesthesia !== undefined && { anesthesia: anesthesia || null }),
    ...(faqs !== undefined && {
      faqs: Array.isArray(faqs) ? faqs : [],
    }),
    ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
    ...(published !== undefined && { published }),
    ...(categoryId && { categoryId }),
  };

  const updatedTreatment = await ctx.prisma.treatment.update({
    where: { id },
    data: updateData,
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: updatedTreatment.id,
    entityType: ENTITY_TYPE.TREATMENT,
    ENV: ctx.env,
    commands: { updateTreatmentCountOnCategory: true },
  });

  const denormFieldsChanged =
    name !== undefined ||
    treatmentImage !== undefined ||
    categoryId !== undefined ||
    overview !== undefined;

  if (denormFieldsChanged) {
    await cascadeTreatmentDenormFields({
      prisma: ctx.prisma,
      eventBusName: ctx.config.EVENT_BUS_NAME,
      env: ctx.env,
      treatmentId: updatedTreatment.id,
    });
  }

  const dto = toTreatmentDto(updatedTreatment);

  await logTreatmentUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    treatment: dto,
    logData: updateData,
  });

  await emitTreatmentNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    entityType: "treatment",
    entity: dto,
  });

  return {
    statusCode: 200,
    data: { message: "Data updated successfully", success: true, item: dto },
  };
};

export const deleteTreatment = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Treatment ID is required"],
    });
  }

  const { treatment, ok, errors } = await getTreatmentById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toTreatmentDto(treatment);

  const deletedTreatment = await ctx.prisma.treatment.update({
    where: { id },
    data: { deleted: true, deletedAt: new Date() },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: deletedTreatment.id,
    entityType: ENTITY_TYPE.TREATMENT,
    ENV: ctx.env,
    commands: { updateTreatmentCountOnCategory: true },
  });

  await logTreatmentDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    treatment: dtoBefore,
  });

  await emitTreatmentNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    entityType: "treatment",
    entity: dtoBefore,
  });

  return {
    statusCode: 200,
    data: {
      message: "Data deleted successfully",
      success: true,
      item: toTreatmentDto(deletedTreatment),
    },
  };
};
