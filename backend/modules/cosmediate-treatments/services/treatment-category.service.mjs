import {
  emitTreatmentNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
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
  logCategoryCreate,
  logCategoryDelete,
  logCategoryUpdate,
} from "./treatment-category-compliance.service.mjs";
import {
  findCategoriesByNames,
  getCategoryById,
} from "./treatment-category.repository.mjs";
import { cascadeCategoryNameDenormFields } from "../lib/treatment-denorm-cascade.mjs";
import { searchTreatmentCategories } from "./treatment-category-search.service.mjs";
import { toTreatmentCategoryDto } from "../lib/treatment-category-dto.mjs";
import { isManagementRoute } from "../lib/route-scope.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_CATEGORY.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create treatment categories"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_CATEGORY.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view treatment categories"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_CATEGORY.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update treatment categories"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_CATEGORY.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete treatment categories"],
    });
  }
};

export const createCategory = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT_CATEGORY.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const { categories = [], published = false } = reqBody;

  const createData = categories.map((category) => ({
    name: category.toLowerCase(),
    published,
    entityType: ENTITY_TYPE.TREATMENT_CATEGORY,
  }));

  await ctx.prisma.treatmentCategory.createMany({ data: createData });

  const insertedItems = await findCategoriesByNames(
    ctx.prisma,
    createData.map((c) => c.name),
  );

  for (const item of insertedItems) {
    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
      schemaVersion: "1",
      entityId: item.id,
      entityType: ENTITY_TYPE.TREATMENT_CATEGORY,
      ENV: ctx.env,
    });
  }

  const items = insertedItems.map(toTreatmentCategoryDto);

  await logCategoryCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    category: items[0],
    logData: { categories: items.map((c) => ({ id: c.id, name: c.name })) },
  });

  for (const item of items) {
    await emitTreatmentNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.CREATED,
      ctx,
      entityType: "treatment category",
      entity: item,
    });
  }

  return {
    statusCode: 201,
    data: { message: "Data created successfully", success: true, item: items },
  };
};

export const getCategoryByIdHandler = async (ctx) => {
  const categoryId = ctx.queryParams?.id;
  if (!categoryId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid category ID in query params"],
    });
  }

  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { category, ok } = await getCategoryById(ctx.prisma, categoryId);

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toTreatmentCategoryDto(category) : null,
      success: ok,
    },
  };
};

export const listCategories = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT_CATEGORY.LIST,
    normalizeRequest(ctx.reqBody),
  );

  const indexAlias = `treatment_categories-${ctx.env}`;
  const allRecords = await searchTreatmentCategories({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map(toTreatmentCategoryDto),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const updateCategory = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT_CATEGORY.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const { id, name, published } = reqBody;

  const { ok, errors } = await getCategoryById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const updateData = {
    ...(name && { name: name.toLowerCase() }),
    ...(published !== undefined && { published }),
  };

  const updatedCategory = await ctx.prisma.treatmentCategory.update({
    where: { id },
    data: updateData,
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: updatedCategory.id,
    entityType: ENTITY_TYPE.TREATMENT_CATEGORY,
    ENV: ctx.env,
  });

  if (name) {
    await cascadeCategoryNameDenormFields({
      prisma: ctx.prisma,
      eventBusName: ctx.config.EVENT_BUS_NAME,
      env: ctx.env,
      categoryId: updatedCategory.id,
      categoryName: updatedCategory.name,
    });
  }

  const dto = toTreatmentCategoryDto(updatedCategory);

  await logCategoryUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    category: dto,
    logData: updateData,
  });

  await emitTreatmentNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    entityType: "treatment category",
    entity: dto,
  });

  return {
    statusCode: 200,
    data: { message: "Data updated successfully", success: true, item: dto },
  };
};

export const deleteCategory = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Category ID is required"],
    });
  }

  const { category, ok, errors } = await getCategoryById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toTreatmentCategoryDto(category);

  const deletedCategory = await ctx.prisma.treatmentCategory.update({
    where: { id },
    data: { deleted: true, deletedAt: new Date() },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: deletedCategory.id,
    entityType: ENTITY_TYPE.TREATMENT_CATEGORY,
    ENV: ctx.env,
  });

  await logCategoryDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    category: dtoBefore,
  });

  await emitTreatmentNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    entityType: "treatment category",
    entity: dtoBefore,
  });

  return {
    statusCode: 200,
    data: {
      message: "Data deleted successfully",
      success: true,
      item: toTreatmentCategoryDto(deletedCategory),
    },
  };
};
