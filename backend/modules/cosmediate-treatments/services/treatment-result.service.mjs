import {
  emitClinicTreatmentNotificationEmails,
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

import { assertClinicTreatmentClinicAccess } from "../lib/clinic-treatment-scope.mjs";
import {
  logTreatmentResultCreate,
  logTreatmentResultDelete,
  logTreatmentResultUpdate,
} from "./treatment-result-compliance.service.mjs";
import {
  getClinicTreatmentForResult,
  getTreatmentRecordById,
  getTreatmentResultById,
} from "./treatment-result.repository.mjs";
import { searchTreatmentResults } from "./treatment-result-search.service.mjs";
import { toTreatmentResultDto } from "../lib/treatment-result-dto.mjs";
import { isManagementRoute } from "../lib/route-scope.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_RESULT.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create treatment results"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_RESULT.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view treatment results"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_RESULT.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update treatment results"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT_RESULT.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete treatment results"],
    });
  }
};

const buildDenormFromClinicTreatment = (clinicTreatment) => ({
  clinicTreatmentId: clinicTreatment.id,
  clinicId: clinicTreatment.clinicId,
  treatmentId: clinicTreatment.treatmentId,
  categoryId: clinicTreatment.categoryId,
  categoryName: clinicTreatment.categoryName,
});

const resolveClinicGalleryReference = async (
  prisma,
  authContext,
  clinicTreatmentId,
) => {
  if (!clinicTreatmentId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Clinic treatment ID is required for clinic gallery results"],
    });
  }

  const clinicTreatment = await getClinicTreatmentForResult(
    prisma,
    clinicTreatmentId,
  );

  if (!clinicTreatment) {
    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      details: ["Clinic treatment offering not found"],
    });
  }

  await assertClinicTreatmentClinicAccess(
    prisma,
    authContext,
    clinicTreatment.clinicId,
  );

  return buildDenormFromClinicTreatment(clinicTreatment);
};

const resolveAdminCatalogReference = async (prisma, treatmentId) => {
  if (!treatmentId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Treatment ID is required for admin catalog results"],
    });
  }

  const treatment = await getTreatmentRecordById(prisma, treatmentId);
  if (!treatment) {
    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      details: ["Treatment not found"],
    });
  }

  return {
    treatmentId: treatment.id,
    clinicTreatmentId: null,
    clinicId: null,
    categoryId: null,
    categoryName: null,
  };
};

export const createTreatmentResult = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT_RESULT.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const {
    clinicTreatmentId = "",
    treatmentId = "",
    beforeImage = "",
    afterImage = "",
    description = "",
  } = reqBody;

  const refs = clinicTreatmentId
    ? await resolveClinicGalleryReference(
        ctx.prisma,
        ctx.authContext,
        clinicTreatmentId,
      )
    : await resolveAdminCatalogReference(ctx.prisma, treatmentId);

  const newTreatmentResult = await ctx.prisma.treatmentResult.create({
    data: {
      beforeImage,
      afterImage,
      description,
      ownerType: refs.clinicTreatmentId ? "CLINIC" : "ADMIN",
      clinicTreatmentId: refs.clinicTreatmentId,
      clinicId: refs.clinicId,
      treatmentId: refs.treatmentId,
      categoryId: refs.categoryId,
      categoryName: refs.categoryName,
      entityType: ENTITY_TYPE.TREATMENT_RESULT,
    },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
    schemaVersion: "1",
    entityId: newTreatmentResult.id,
    entityType: ENTITY_TYPE.TREATMENT_RESULT,
    ENV: ctx.env,
  });

  const { treatmentResult } = await getTreatmentResultById(
    ctx.prisma,
    newTreatmentResult.id,
  );
  const dto = toTreatmentResultDto(treatmentResult);

  await logTreatmentResultCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    treatmentResult: dto,
  });

  if (dto.ownerType === "CLINIC" && dto.clinicId) {
    await emitClinicTreatmentNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.CREATED,
      ctx,
      clinicId: dto.clinicId,
      clinicName: dto.clinicName ?? "",
      treatmentName: dto.treatmentName ?? "",
      resultId: dto.id,
    });
  } else {
    await emitTreatmentNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.CREATED,
      ctx,
      entityType: "treatment result",
      entity: { id: dto.id, name: dto.treatmentName },
    });
  }

  return {
    statusCode: 201,
    data: { message: "Data created successfully", success: true, item: dto },
  };
};

export const getTreatmentResultByIdHandler = async (ctx) => {
  const treatmentResultId = ctx.queryParams?.id;
  if (!treatmentResultId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid treatment result ID in query params"],
    });
  }

  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { treatmentResult, ok } = await getTreatmentResultById(
    ctx.prisma,
    treatmentResultId,
  );

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toTreatmentResultDto(treatmentResult) : null,
      success: ok,
    },
  };
};

export const listTreatmentResults = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: rawQuery } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT_RESULT.LIST,
    normalizeRequest(ctx.reqBody),
  );

  const treatmentId =
    rawQuery.filters?.treatmentId ?? rawQuery.treatmentId ?? null;
  const query = {
    ...rawQuery,
    filters: {
      ...(rawQuery.filters ?? {}),
      ...(treatmentId ? { treatmentId } : {}),
    },
  };
  delete query.treatmentId;

  const indexAlias = `treatment_results-${ctx.env}`;
  const { items, total, nextToken } = await searchTreatmentResults({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!items.length ? { message: "No data found" } : {}),
      items: items.map(toTreatmentResultDto).filter(Boolean),
      total,
      nextToken: nextToken ?? null,
      success: items.length > 0,
    },
  };
};

export const updateTreatmentResult = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT_RESULT.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const {
    id: treatmentResultId,
    beforeImage,
    afterImage,
    description,
    treatmentId,
    clinicTreatmentId,
  } = reqBody;

  const { treatmentResult, ok, errors } = await getTreatmentResultById(
    ctx.prisma,
    treatmentResultId,
  );
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  if (treatmentResult.ownerType === "CLINIC" && treatmentResult.clinicId) {
    await assertClinicTreatmentClinicAccess(
      ctx.prisma,
      ctx.authContext,
      treatmentResult.clinicId,
    );
  }

  const updateData = {
    ...(beforeImage !== undefined && { beforeImage }),
    ...(afterImage !== undefined && { afterImage }),
    ...(description !== undefined && { description }),
  };

  if (treatmentResult.ownerType === "ADMIN" && treatmentId !== undefined) {
    const refs = await resolveAdminCatalogReference(ctx.prisma, treatmentId);
    Object.assign(updateData, refs);
  } else if (clinicTreatmentId !== undefined) {
    const refs = await resolveClinicGalleryReference(
      ctx.prisma,
      ctx.authContext,
      clinicTreatmentId,
    );
    Object.assign(updateData, refs);
  }

  const updatedTreatmentResult = await ctx.prisma.treatmentResult.update({
    where: { id: treatmentResult.id },
    data: updateData,
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: updatedTreatmentResult.id,
    entityType: ENTITY_TYPE.TREATMENT_RESULT,
    ENV: ctx.env,
  });

  const { treatmentResult: refreshed } = await getTreatmentResultById(
    ctx.prisma,
    updatedTreatmentResult.id,
  );
  const dto = toTreatmentResultDto(refreshed);

  await logTreatmentResultUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    treatmentResult: dto,
    logData: updateData,
  });

  if (dto.ownerType === "CLINIC" && dto.clinicId) {
    await emitClinicTreatmentNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.UPDATED,
      ctx,
      clinicId: dto.clinicId,
      clinicName: dto.clinicName ?? "",
      treatmentName: dto.treatmentName ?? "",
      resultId: dto.id,
    });
  } else {
    await emitTreatmentNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.UPDATED,
      ctx,
      entityType: "treatment result",
      entity: { id: dto.id, name: dto.treatmentName },
    });
  }

  return {
    statusCode: 200,
    data: { message: "Data updated successfully", success: true, item: dto },
  };
};

export const deleteTreatmentResult = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const treatmentResultId = ctx.queryParams?.id;
  if (!treatmentResultId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Treatment result ID is required"],
    });
  }

  const { treatmentResult, ok, errors } = await getTreatmentResultById(
    ctx.prisma,
    treatmentResultId,
  );
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  if (treatmentResult.ownerType === "CLINIC" && treatmentResult.clinicId) {
    await assertClinicTreatmentClinicAccess(
      ctx.prisma,
      ctx.authContext,
      treatmentResult.clinicId,
    );
  }

  const dtoBefore = toTreatmentResultDto(treatmentResult);

  await ctx.prisma.treatmentResult.update({
    where: { id: treatmentResult.id },
    data: { deleted: true, deletedAt: new Date() },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: treatmentResult.id,
    entityType: ENTITY_TYPE.TREATMENT_RESULT,
    ENV: ctx.env,
  });

  await logTreatmentResultDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    treatmentResult: dtoBefore,
  });

  if (dtoBefore.ownerType === "CLINIC" && dtoBefore.clinicId) {
    await emitClinicTreatmentNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.DELETED,
      ctx,
      clinicId: dtoBefore.clinicId,
      clinicName: dtoBefore.clinicName ?? "",
      treatmentName: dtoBefore.treatmentName ?? "",
      resultId: dtoBefore.id,
    });
  } else {
    await emitTreatmentNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.DELETED,
      ctx,
      entityType: "treatment result",
      entity: { id: dtoBefore.id, name: dtoBefore.treatmentName },
    });
  }

  return {
    statusCode: 200,
    data: { message: "Data deleted successfully", success: true },
  };
};
