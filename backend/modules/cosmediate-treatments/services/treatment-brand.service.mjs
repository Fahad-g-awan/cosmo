import {
  emitTreatmentNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  logBrandCreate,
  logBrandDelete,
  logBrandUpdate,
} from "./treatment-brand-compliance.service.mjs";
import {
  findBrandsByNames,
  getBrandById,
} from "./treatment-brand.repository.mjs";
import { searchTreatmentBrands } from "./treatment-brand-search.service.mjs";
import { toTreatmentBrandDto } from "../lib/treatment-brand-dto.mjs";
import { isManagementRoute } from "../lib/route-scope.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_BRAND.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create treatment brands"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_BRAND.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view treatment brands"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_BRAND.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update treatment brands"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_BRAND.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete treatment brands"],
    });
  }
};

export const createBrands = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT_BRAND.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const { brands = [], published = false } = reqBody;

  const createData = brands.map((brand) => ({
    name: brand.toLowerCase(),
    published,
    entityType: ENTITY_TYPE.TREATMENT_BRAND,
  }));

  await ctx.prisma.treatmentBrand.createMany({ data: createData });

  const insertedItems = await findBrandsByNames(
    ctx.prisma,
    createData.map((b) => b.name),
  );

  for (const item of insertedItems) {
    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
      schemaVersion: "1",
      entityId: item.id,
      entityType: ENTITY_TYPE.TREATMENT_BRAND,
      ENV: ctx.env,
    });
  }

  const items = insertedItems.map(toTreatmentBrandDto);

  await logBrandCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    brand: items[0],
    logData: { brands: items.map((b) => ({ id: b.id, name: b.name })) },
  });

  for (const item of items) {
    await emitTreatmentNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.CREATED,
      ctx,
      entityType: "treatment brand",
      entity: item,
    });
  }

  return {
    statusCode: 201,
    data: { message: "Data created successfully", success: true, item: items },
  };
};

export const getBrandByIdHandler = async (ctx) => {
  const brandId = ctx.queryParams?.id;
  if (!brandId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid brand ID in query params"],
    });
  }

  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { brand, ok } = await getBrandById(ctx.prisma, brandId);

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toTreatmentBrandDto(brand) : null,
      success: ok,
    },
  };
};

export const listBrands = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT_BRAND.LIST,
    normalizeRequest(ctx.reqBody),
  );

  const indexAlias = `treatment_brands-${ctx.env}`;
  const allRecords = await searchTreatmentBrands({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: allRecords.items.map(toTreatmentBrandDto),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const updateBrand = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT_BRAND.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const { id, name, published } = reqBody;

  const { ok, errors } = await getBrandById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const updateData = {
    ...(name && { name: name.toLowerCase() }),
    ...(published !== undefined && { published }),
  };

  const updatedBrand = await ctx.prisma.treatmentBrand.update({
    where: { id },
    data: updateData,
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: updatedBrand.id,
    entityType: ENTITY_TYPE.TREATMENT_BRAND,
    ENV: ctx.env,
  });

  const dto = toTreatmentBrandDto(updatedBrand);

  await logBrandUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    brand: dto,
    logData: updateData,
  });

  await emitTreatmentNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    entityType: "treatment brand",
    entity: dto,
  });

  return {
    statusCode: 200,
    data: { message: "Data updated successfully", success: true, item: dto },
  };
};

export const deleteBrand = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Brand ID is required"],
    });
  }

  const { brand, ok, errors } = await getBrandById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toTreatmentBrandDto(brand);

  const deletedBrand = await ctx.prisma.treatmentBrand.update({
    where: { id },
    data: { deleted: true, deletedAt: new Date() },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: deletedBrand.id,
    entityType: ENTITY_TYPE.TREATMENT_BRAND,
    ENV: ctx.env,
  });

  await logBrandDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    brand: dtoBefore,
  });

  await emitTreatmentNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    entityType: "treatment brand",
    entity: dtoBefore,
  });

  return {
    statusCode: 200,
    data: {
      message: "Data deleted successfully",
      success: true,
      item: toTreatmentBrandDto(deletedBrand),
    },
  };
};
