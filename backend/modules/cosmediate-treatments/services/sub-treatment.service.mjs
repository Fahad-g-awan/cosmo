import {
  CLINIC_TREATMENT_EMAIL_KIND,
  emitClinicTreatmentNotificationEmails,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  getClinicTreatmentForSubTreatmentSync,
  getSubTreatmentById,
  getTreatmentBrandsByIds,
  hydrateSubTreatmentsWithBrands,
  listSubTreatmentsByClinicTreatment,
  rollupClinicTreatmentPrices,
} from "./sub-treatment.repository.mjs";
import { searchSubTreatments } from "./sub-treatment-search.service.mjs";
import { cascadePriceAggregatesFromClinicTreatment } from "../lib/price-aggregate-cascade.mjs";
import { reindexHubAggregateFanout } from "../lib/treatment-aggregate-reindex.mjs";
import { assertClinicTreatmentClinicAccess } from "../lib/clinic-treatment-scope.mjs";
import { buildTreatmentsFilterData } from "../lib/treatments-filter-data.mjs";
import { emitEntityIndexEvents } from "../lib/entity-index-events.mjs";
import { toSubTreatmentDto } from "../lib/sub-treatment-dto.mjs";
import {
  isManagementRoute,
  isPublicRoute,
  resolveSubTreatmentListFilters,
} from "../lib/route-scope.mjs";

const assertCanUpsert = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.SUB_TREATMENT.UPSERT])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to manage sub-treatments"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.SUB_TREATMENT.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view sub-treatments"],
    });
  }
};

const buildDenormFromClinicTreatment = (clinicTreatment) => ({
  clinicId: clinicTreatment.clinicId,
  treatmentId: clinicTreatment.treatmentId,
  categoryId: clinicTreatment.categoryId,
  categoryName: clinicTreatment.categoryName,
});

const syncSubTreatmentBrands = async (tx, subTreatmentId, brandIds) => {
  await tx.subTreatmentBrand.deleteMany({ where: { subTreatmentId } });
  if (!brandIds.length) return;

  await tx.subTreatmentBrand.createMany({
    data: brandIds.map((brandId) => ({ subTreatmentId, brandId })),
  });
};

const validateBrandIds = async (prisma, brandIds) => {
  const uniqueBrandIds = [...new Set(brandIds)];
  const brands = await getTreatmentBrandsByIds(prisma, uniqueBrandIds);

  if (brands.length !== uniqueBrandIds.length) {
    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      details: ["One or more treatment brands were not found"],
    });
  }

  return uniqueBrandIds;
};

/**
 * Full-set sync of sub-treatments for one clinic offering.
 */
export const syncClinicSubTreatments = async (ctx) => {
  assertCanUpsert(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.SUB_TREATMENT.CLINIC_SYNC,
    normalizeRequest(ctx.reqBody),
  );

  const { clinicTreatmentId, subTreatments = [] } = reqBody;

  for (const row of subTreatments) {
    if (
      !String(row?.name ?? "").trim() ||
      !(Number(row?.price) > 0) ||
      !String(row?.duration ?? "").trim() ||
      !Array.isArray(row?.brandIds) ||
      row.brandIds.length === 0
    ) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: [
          "Each sub-treatment requires name, price, duration, and at least one brand",
        ],
      });
    }
  }

  const clinicTreatment = await getClinicTreatmentForSubTreatmentSync(
    ctx.prisma,
    clinicTreatmentId,
  );

  if (!clinicTreatment) {
    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      details: ["Clinic treatment offering not found"],
    });
  }

  await assertClinicTreatmentClinicAccess(
    ctx.prisma,
    ctx.authContext,
    clinicTreatment.clinicId,
  );

  const existingRows = await listSubTreatmentsByClinicTreatment(
    ctx.prisma,
    clinicTreatmentId,
  );
  const existingById = new Map(existingRows.map((row) => [row.id, row]));
  const payloadIds = new Set(
    subTreatments.map((row) => row.id).filter(Boolean),
  );

  for (const id of payloadIds) {
    if (!existingById.has(id)) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: [`Sub treatment does not belong to this offering: ${id}`],
      });
    }
  }

  const denorm = buildDenormFromClinicTreatment(clinicTreatment);
  const changedIds = [];
  const indexEvents = [];

  const brandIdsByRow = new Map();
  for (const row of subTreatments) {
    brandIdsByRow.set(row, await validateBrandIds(ctx.prisma, row.brandIds));
  }

  await ctx.prisma.$transaction(async (tx) => {
    const toRemove = existingRows.filter((row) => !payloadIds.has(row.id));

    for (const row of toRemove) {
      await tx.subTreatment.update({
        where: { id: row.id },
        data: { deleted: true, deletedAt: new Date() },
      });
      changedIds.push(row.id);
      indexEvents.push({
        entityId: row.id,
        entityType: ENTITY_TYPE.SUB_TREATMENT,
        action: DB_EVENT.SOFT_DELETE,
      });
    }

    for (const row of subTreatments) {
      const brandIds = brandIdsByRow.get(row) ?? [];

      if (row.id) {
        await tx.subTreatment.update({
          where: { id: row.id },
          data: {
            name: row.name,
            price: row.price,
            duration: row.duration,
            available: row.available,
            deleted: false,
            deletedAt: null,
            ...denorm,
          },
        });
        await syncSubTreatmentBrands(tx, row.id, brandIds);
        changedIds.push(row.id);
        indexEvents.push({
          entityId: row.id,
          entityType: ENTITY_TYPE.SUB_TREATMENT,
          action: DB_EVENT.UPDATE,
        });
      } else {
        const created = await tx.subTreatment.create({
          data: {
            clinicTreatmentId,
            entityType: ENTITY_TYPE.SUB_TREATMENT,
            name: row.name,
            price: row.price,
            duration: row.duration,
            available: row.available,
            ...denorm,
          },
        });
        await syncSubTreatmentBrands(tx, created.id, brandIds);
        changedIds.push(created.id);
        indexEvents.push({
          entityId: created.id,
          entityType: ENTITY_TYPE.SUB_TREATMENT,
          action: DB_EVENT.INSERT,
        });
      }
    }

    await rollupClinicTreatmentPrices(tx, clinicTreatmentId);
  });

  const items = await listSubTreatmentsByClinicTreatment(
    ctx.prisma,
    clinicTreatmentId,
  );

  await emitEntityIndexEvents({
    eventBusName: ctx.config.EVENT_BUS_NAME,
    env: ctx.env,
    events: indexEvents,
  });

  await cascadePriceAggregatesFromClinicTreatment(
    ctx.prisma,
    clinicTreatmentId,
  );

  await reindexHubAggregateFanout({
    prisma: ctx.prisma,
    eventBusName: ctx.config.EVENT_BUS_NAME,
    env: ctx.env,
    clinicTreatmentId,
  });

  const clinic = await ctx.prisma.clinic.findFirst({
    where: { id: clinicTreatment.clinicId, deleted: false },
    select: { name: true },
  });

  await emitClinicTreatmentNotificationEmails({
    kind: CLINIC_TREATMENT_EMAIL_KIND.SUB_TREATMENT_SYNC,
    ctx,
    clinicId: clinicTreatment.clinicId,
    clinicName: clinic?.name ?? "",
    treatmentName: clinicTreatment.treatmentName ?? "",
    clinicTreatmentId,
  });

  return {
    statusCode: 200,
    data: {
      success: true,
      message: "Sub-treatments synced successfully",
      items: items.map(toSubTreatmentDto).filter(Boolean),
      clinicTreatmentId,
    },
  };
};

export const getSubTreatment = async (ctx) => {
  const subTreatmentId = ctx.queryParams?.id;

  if (!subTreatmentId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Sub treatment id is required"],
    });
  }

  const row = await getSubTreatmentById(ctx.prisma, subTreatmentId);
  const ok = Boolean(row);

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toSubTreatmentDto(row) : null,
      success: ok,
    },
  };
};

export const getSubTreatments = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.SUB_TREATMENT.LIST,
    normalizeRequest(ctx.reqBody),
  );
  const filters = resolveSubTreatmentListFilters(
    ctx.routeKey,
    query.filters ?? {},
  );
  const scopedQuery = { ...query, filters };
  const indexAlias = `sub_treatments-${ctx.env}`;

  const {
    items: searchItems,
    total,
    nextToken,
  } = await searchSubTreatments({
    opsClient: ctx.opsClient,
    query: scopedQuery,
    indexAlias,
    publicBrowse: isPublicRoute(ctx.routeKey),
  });

  const hydrated = await hydrateSubTreatmentsWithBrands(
    ctx.prisma,
    searchItems,
  );
  const items = hydrated.map(toSubTreatmentDto).filter(Boolean);

  return {
    statusCode: 200,
    data: {
      ...(!items.length ? { message: "No data found" } : {}),
      items,
      total,
      nextToken,
      success: items.length > 0,
    },
  };
};

export const getTreatmentsFilterData = async (ctx) => {
  const payload = await buildTreatmentsFilterData({
    prisma: ctx.prisma,
    opsClient: ctx.opsClient,
    env: ctx.env,
  });

  return {
    statusCode: 200,
    data: {
      success: true,
      ...payload,
    },
  };
};
