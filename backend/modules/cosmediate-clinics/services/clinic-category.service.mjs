import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import {
  emitClinicCategoryNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
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
} from "./clinic-category-compliance.service.mjs";
import {
  findCategoriesByNames,
  getCategoryById,
  validateCategoryNames,
} from "./clinic-category.repository.mjs";
import { searchClinicCategories } from "./clinic-category-search.service.mjs";
import { toClinicCategoryDto } from "../lib/clinic-category-dto.mjs";
import {
  isManagementRoute,
  resolveClinicCategoryListFilters,
} from "../lib/route-scope.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC_CATEGORY.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create clinic categories"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC_CATEGORY.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view clinic categories"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC_CATEGORY.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update clinic categories"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.CLINIC_CATEGORY.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete clinic categories"],
    });
  }
};

export const createCategory = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.CLINIC_CATEGORY.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const { categories = [], published = false } = reqBody;

  const { ok, errors } = await validateCategoryNames(ctx.prisma, categories);
  if (!ok) throw httpError({ error: API_ERRORS.CONFLICT, details: errors });

  const createData = categories.map((category) => ({
    name: category.toLowerCase(),
    published,
    entityType: ENTITY_TYPE.CLINIC_CATEGORY,
  }));

  await ctx.prisma.clinicCategory.createMany({ data: createData });

  const insertedItems = await findCategoriesByNames(
    ctx.prisma,
    createData.map((c) => c.name),
  );

  for (const item of insertedItems) {
    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
      schemaVersion: "1",
      entityId: item.id,
      entityType: ENTITY_TYPE.CLINIC_CATEGORY,
      ENV: ctx.env,
    });
  }

  const items = insertedItems.map(toClinicCategoryDto);

  await logCategoryCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    category: items[0],
    logData: { categories: items.map((c) => ({ id: c.id, name: c.name })) },
  });

  for (const item of items) {
    await emitClinicCategoryNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.CREATED,
      ctx,
      category: item,
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
      item: ok ? toClinicCategoryDto(category) : null,
      success: ok,
    },
  };
};

export const listCategories = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.CLINIC_CATEGORY.LIST,
    normalizeRequest(ctx.reqBody),
  );
  const filters = resolveClinicCategoryListFilters(
    ctx.routeKey,
    query?.filters ?? {},
  );

  const indexAlias = `clinic_categories-${ctx.env}`;
  const allRecords = await searchClinicCategories({
    opsClient: ctx.opsClient,
    query: { ...query, filters },
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map(toClinicCategoryDto),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const updateCategory = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.CLINIC_CATEGORY.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const { id, name, published } = reqBody;

  const { ok, errors } = await getCategoryById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  if (name) {
    const duplicate = await ctx.prisma.clinicCategory.findFirst({
      where: {
        name: name.toLowerCase(),
        deleted: false,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw httpError({
        error: API_ERRORS.CONFLICT,
        details: [`Category already exists: ${name}`],
      });
    }
  }

  const updateData = {
    ...(name && { name: name.toLowerCase() }),
    ...(published !== undefined && { published }),
  };

  const updatedCategory = await ctx.prisma.clinicCategory.update({
    where: { id },
    data: updateData,
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: updatedCategory.id,
    entityType: ENTITY_TYPE.CLINIC_CATEGORY,
    ENV: ctx.env,
  });

  const dto = toClinicCategoryDto(updatedCategory);

  await logCategoryUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    category: dto,
    logData: updateData,
  });

  await emitClinicCategoryNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    category: dto,
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

  const dtoBefore = toClinicCategoryDto(category);

  const deletedCategory = await ctx.prisma.clinicCategory.update({
    where: { id },
    data: { deleted: true, deletedAt: new Date() },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: deletedCategory.id,
    entityType: ENTITY_TYPE.CLINIC_CATEGORY,
    ENV: ctx.env,
  });

  await logCategoryDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    category: dtoBefore,
  });

  await emitClinicCategoryNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    category: dtoBefore,
  });

  return {
    statusCode: 200,
    data: {
      message: "Data deleted successfully",
      success: true,
      item: toClinicCategoryDto(deletedCategory),
    },
  };
};
