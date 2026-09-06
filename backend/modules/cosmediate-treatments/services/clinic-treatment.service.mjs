import {
  CLINIC_TREATMENT_EMAIL_KIND,
  emitClinicTreatmentNotificationEmails,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { resolveClinicOrgIds } from "/opt/nodejs/services/prisma/org/clinic/org.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  countActiveAssignmentsForClinicTreatment,
  getTreatmentsForOfferingSync,
  listClinicTreatmentsByClinic,
} from "./clinic-treatment.repository.mjs";
import { searchClinicTreatments } from "./clinic-treatment-search.service.mjs";
import { buildClinicTreatmentDenormFromTreatment } from "../lib/clinic-treatment-denorm.mjs";
import { assertClinicTreatmentClinicAccess } from "../lib/clinic-treatment-scope.mjs";
import {
  emitClinicTreatmentIndexEvents,
  emitHubChildDocumentUpdates,
  emitSpecialistReindex,
  emitTreatmentReindex,
} from "../lib/treatment-aggregate-reindex.mjs";
import { cascadePriceAggregatesForClinicOfferingSync } from "../lib/price-aggregate-cascade.mjs";
import { logClinicTreatmentSync } from "./clinic-treatment-compliance.service.mjs";
import { resolveClinicTreatmentListFilters } from "../lib/route-scope.mjs";
import { toClinicTreatmentDto } from "../lib/clinic-treatment-dto.mjs";

const assertCanManageSelection = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT.SELECTION])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to manage clinic treatment offerings"],
    });
  }
};

const normalizeClinicTreatmentListQuery = (reqBody = {}) => {
  const clinicId = reqBody.clinicId ?? reqBody.filters?.clinicId;
  if (!clinicId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Clinic ID is required"],
    });
  }

  return {
    ...reqBody,
    filters: {
      ...(reqBody.filters ?? {}),
      clinicId,
    },
  };
};

/**
 * Full-set sync of ACTIVE clinic offerings for one clinic.
 * Removes (INACTIVE) offerings not in `treatmentIds`; creates or re-activates the rest.
 */
export const syncClinicTreatments = async (ctx) => {
  assertCanManageSelection(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT.CLINIC_TREATMENT_SYNC,
    normalizeRequest(ctx.reqBody),
  );

  const { clinicId, treatmentIds = [] } = reqBody;
  const uniqueTreatmentIds = [...new Set(treatmentIds)];

  await assertClinicTreatmentClinicAccess(
    ctx.prisma,
    ctx.authContext,
    clinicId,
  );

  const treatments = await getTreatmentsForOfferingSync(
    ctx.prisma,
    uniqueTreatmentIds,
  );

  if (treatments.length !== uniqueTreatmentIds.length) {
    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      details: ["One or more treatments were not found"],
    });
  }

  const existingRows = await listClinicTreatmentsByClinic(ctx.prisma, clinicId);
  const existingByTreatmentId = new Map(
    existingRows.map((row) => [row.treatmentId, row]),
  );
  const activeByTreatmentId = new Map(
    existingRows
      .filter((row) => row.status === "ACTIVE")
      .map((row) => [row.treatmentId, row]),
  );

  const targetSet = new Set(uniqueTreatmentIds);
  const toDeactivateTreatmentIds = [...activeByTreatmentId.keys()].filter(
    (treatmentId) => !targetSet.has(treatmentId),
  );

  for (const treatmentId of toDeactivateTreatmentIds) {
    const row = activeByTreatmentId.get(treatmentId);
    const assignmentCount = await countActiveAssignmentsForClinicTreatment(
      ctx.prisma,
      row.id,
    );
    if (assignmentCount > 0) {
      throw httpError({
        error: API_ERRORS.CLINIC_TREATMENT_HAS_ASSIGNMENTS,
        details: [
          `Cannot remove treatment offering while specialists are still assigned (treatmentId: ${treatmentId})`,
        ],
      });
    }
  }

  const treatmentById = new Map(treatments.map((t) => [t.id, t]));
  const added = [];
  const removed = [];
  const createdHubIds = [];
  const updatedHubIds = [];

  await ctx.prisma.$transaction(async (tx) => {
    for (const treatmentId of toDeactivateTreatmentIds) {
      const row = existingByTreatmentId.get(treatmentId);
      await tx.clinicTreatment.update({
        where: { id: row.id },
        data: { status: "INACTIVE" },
      });
      updatedHubIds.push(row.id);
      removed.push(treatmentId);
    }

    for (const treatmentId of uniqueTreatmentIds) {
      const treatment = treatmentById.get(treatmentId);
      const denorm = buildClinicTreatmentDenormFromTreatment(treatment);
      const existing = existingByTreatmentId.get(treatmentId);

      if (existing) {
        if (existing.status !== "ACTIVE") {
          added.push(treatmentId);
        }
        await tx.clinicTreatment.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            ...denorm,
          },
        });
        updatedHubIds.push(existing.id);
      } else {
        const created = await tx.clinicTreatment.create({
          data: {
            clinicId,
            treatmentId,
            status: "ACTIVE",
            entityType: ENTITY_TYPE.CLINIC_TREATMENT,
            ...denorm,
          },
        });
        createdHubIds.push(created.id);
        added.push(treatmentId);
      }
    }
  });

  const affectedHubIds = [...new Set([...createdHubIds, ...updatedHubIds])];

  await emitClinicTreatmentIndexEvents({
    eventBusName: ctx.config.EVENT_BUS_NAME,
    env: ctx.env,
    createdIds: createdHubIds,
    updatedIds: updatedHubIds,
  });

  if (affectedHubIds.length) {
    const assignmentRows = await ctx.prisma.clinicSpecialistTreatment.findMany({
      where: { clinicTreatmentId: { in: affectedHubIds }, deleted: false },
      select: { id: true },
    });

    for (const row of assignmentRows) {
      await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
        schemaVersion: "1",
        entityId: row.id,
        entityType: ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT,
        ENV: ctx.env,
      });
    }

    await emitHubChildDocumentUpdates({
      prisma: ctx.prisma,
      eventBusName: ctx.config.EVENT_BUS_NAME,
      env: ctx.env,
      clinicTreatmentIds: affectedHubIds,
    });
  }

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: clinicId,
    entityType: ENTITY_TYPE.CLINIC,
    ENV: ctx.env,
  });

  await emitTreatmentReindex({
    eventBusName: ctx.config.EVENT_BUS_NAME,
    env: ctx.env,
    treatmentIds: [...new Set([...added, ...removed])],
  });

  const { specialistIds } = await cascadePriceAggregatesForClinicOfferingSync(
    ctx.prisma,
    {
      clinicId,
      treatmentIds: [...new Set([...added, ...removed])],
    },
  );

  await emitSpecialistReindex({
    eventBusName: ctx.config.EVENT_BUS_NAME,
    env: ctx.env,
    specialistIds,
  });

  let orgRootId = null;
  let clinicName = "";
  try {
    const org = await resolveClinicOrgIds(ctx.prisma, clinicId);
    orgRootId = org.rootId;
  } catch {
    orgRootId = null;
  }

  const clinic = await ctx.prisma.clinic.findFirst({
    where: { id: clinicId, deleted: false },
    select: { name: true },
  });
  clinicName = clinic?.name ?? "";

  await logClinicTreatmentSync({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    clinicTreatment: { clinicId, clinicName },
    logData: {
      clinicId,
      clinicName,
      orgRootId,
      added,
      removed,
      treatmentIds: uniqueTreatmentIds,
    },
  });

  if (added.length || removed.length) {
    await emitClinicTreatmentNotificationEmails({
      kind: CLINIC_TREATMENT_EMAIL_KIND.OFFERING_SYNC,
      ctx,
      clinicId,
      clinicName,
      addedTreatmentIds: added,
      removedTreatmentIds: removed,
    });
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: "Clinic treatments synced successfully",
      added,
      removed,
    },
  };
};

/**
 * Auth-scoped list of clinic offerings (dashboard selection tab).
 */
export const listClinicTreatments = async (ctx) => {
  assertCanManageSelection(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT.CLINIC_TREATMENT_LIST,
    normalizeRequest(ctx.reqBody),
  );

  const baseQuery = normalizeClinicTreatmentListQuery(reqBody);
  const filters = resolveClinicTreatmentListFilters(baseQuery.filters ?? {});

  await assertClinicTreatmentClinicAccess(
    ctx.prisma,
    ctx.authContext,
    filters.clinicId,
  );

  const scopedQuery = { ...baseQuery, filters };
  const indexAlias = `clinic_treatments-${ctx.env}`;

  const { items, total, nextToken } = await searchClinicTreatments({
    opsClient: ctx.opsClient,
    query: scopedQuery,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      success: true,
      message: "Clinic treatments fetched successfully",
      items: items.map(toClinicTreatmentDto).filter(Boolean),
      total,
      nextToken: nextToken ?? null,
    },
  };
};
