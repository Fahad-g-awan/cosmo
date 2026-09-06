import {
  CLINIC_TREATMENT_EMAIL_KIND,
  emitClinicTreatmentNotificationEmails,
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
  getActiveClinicSpecialistLinks,
  getClinicTreatmentForAssignmentSync,
  listAssignmentsByClinicTreatment,
} from "./clinic-specialist-treatment.repository.mjs";
import {
  emitTreatmentReindex,
  refreshSpecialistPricesForAssignments,
} from "../lib/treatment-aggregate-reindex.mjs";
import {
  isManagementRoute,
  isPublicRoute,
  resolveClinicSpecialistTreatmentListFilters,
} from "../lib/route-scope.mjs";
import { searchClinicSpecialistTreatments } from "./clinic-specialist-treatment-search.service.mjs";
import { toClinicSpecialistTreatmentDto } from "../lib/clinic-specialist-treatment-dto.mjs";
import { assertClinicTreatmentClinicAccess } from "../lib/clinic-treatment-scope.mjs";
import { emitEntityIndexEvents } from "../lib/entity-index-events.mjs";

const assertCanManageAssignments = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT.SELECTION])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to manage specialist treatment assignments"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.TREATMENT.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view specialist treatment assignments"],
    });
  }
};

const buildDenormFromClinicTreatment = (clinicTreatment) => ({
  clinicId: clinicTreatment.clinicId,
  treatmentId: clinicTreatment.treatmentId,
  categoryId: clinicTreatment.categoryId,
  categoryName: clinicTreatment.categoryName,
  treatmentName: clinicTreatment.treatmentName,
  treatmentImage: clinicTreatment.treatmentImage,
  treatmentOverview: clinicTreatment.treatmentOverview,
});

const validateSpecialistsAtClinic = async (prisma, clinicId, specialistIds) => {
  const uniqueIds = [...new Set(specialistIds)];
  const links = await getActiveClinicSpecialistLinks(
    prisma,
    clinicId,
    uniqueIds,
  );

  if (links.length !== uniqueIds.length) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "One or more specialists are not actively linked to this clinic",
      ],
    });
  }

  return uniqueIds;
};

/**
 * Full-set sync of specialist assignments for one clinic offering.
 */
export const syncClinicAssignments = async (ctx) => {
  assertCanManageAssignments(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT.CLINIC_ASSIGNMENT_SYNC,
    normalizeRequest(ctx.reqBody),
  );

  const { clinicTreatmentId, assignments = [] } = reqBody;

  for (const assignment of assignments) {
    if (
      !String(assignment?.specialistId ?? "").trim() ||
      !String(assignment?.specialistExperience ?? "").trim()
    ) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: [
          "Each assignment requires both a specialist and experience",
        ],
      });
    }
  }

  const clinicTreatment = await getClinicTreatmentForAssignmentSync(
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

  const payloadSpecialistIds = assignments.map((row) => row.specialistId);
  if (payloadSpecialistIds.length !== new Set(payloadSpecialistIds).size) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Duplicate specialist in assignments payload"],
    });
  }

  await validateSpecialistsAtClinic(
    ctx.prisma,
    clinicTreatment.clinicId,
    payloadSpecialistIds,
  );

  const existingRows = await ctx.prisma.clinicSpecialistTreatment.findMany({
    where: { clinicTreatmentId, deleted: false },
  });
  const existingActiveSpecialistIds = existingRows
    .filter((row) => row.status === "ACTIVE")
    .map((row) => row.specialistId);
  const existingBySpecialistId = new Map(
    existingRows.map((row) => [row.specialistId, row]),
  );
  const targetSpecialistIds = new Set(payloadSpecialistIds);
  const denorm = buildDenormFromClinicTreatment(clinicTreatment);
  const changedIds = [];
  const indexEvents = [];

  await ctx.prisma.$transaction(async (tx) => {
    for (const row of existingRows) {
      if (targetSpecialistIds.has(row.specialistId)) continue;

      if (row.status === "ACTIVE") {
        await tx.clinicSpecialistTreatment.update({
          where: { id: row.id },
          data: { status: "INACTIVE" },
        });
        changedIds.push(row.id);
        indexEvents.push({
          entityId: row.id,
          entityType: ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT,
          action: DB_EVENT.UPDATE,
        });
      }
    }

    for (const assignment of assignments) {
      const existing = existingBySpecialistId.get(assignment.specialistId);

      if (existing) {
        await tx.clinicSpecialistTreatment.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            specialistExperience: assignment.specialistExperience,
            ...denorm,
          },
        });
        changedIds.push(existing.id);
        indexEvents.push({
          entityId: existing.id,
          entityType: ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT,
          action: DB_EVENT.UPDATE,
        });
      } else {
        const created = await tx.clinicSpecialistTreatment.create({
          data: {
            clinicTreatmentId,
            specialistId: assignment.specialistId,
            specialistExperience: assignment.specialistExperience,
            status: "ACTIVE",
            entityType: ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT,
            ...denorm,
          },
        });
        changedIds.push(created.id);
        indexEvents.push({
          entityId: created.id,
          entityType: ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT,
          action: DB_EVENT.INSERT,
        });
      }
    }
  });

  const items = await listAssignmentsByClinicTreatment(
    ctx.prisma,
    clinicTreatmentId,
  );

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: clinicTreatment.clinicId,
    entityType: ENTITY_TYPE.CLINIC,
    ENV: ctx.env,
  });

  await emitEntityIndexEvents({
    eventBusName: ctx.config.EVENT_BUS_NAME,
    env: ctx.env,
    events: indexEvents,
  });

  await emitTreatmentReindex({
    eventBusName: ctx.config.EVENT_BUS_NAME,
    env: ctx.env,
    treatmentIds: [clinicTreatment.treatmentId],
  });

  await refreshSpecialistPricesForAssignments({
    prisma: ctx.prisma,
    eventBusName: ctx.config.EVENT_BUS_NAME,
    env: ctx.env,
    assignmentIds: changedIds,
  });

  const addedSpecialistIds = payloadSpecialistIds.filter(
    (specialistId) => !existingActiveSpecialistIds.includes(specialistId),
  );
  const removedSpecialistIds = existingActiveSpecialistIds.filter(
    (specialistId) => !targetSpecialistIds.has(specialistId),
  );

  const clinic = await ctx.prisma.clinic.findFirst({
    where: { id: clinicTreatment.clinicId, deleted: false },
    select: { name: true },
  });

  if (addedSpecialistIds.length || removedSpecialistIds.length) {
    await emitClinicTreatmentNotificationEmails({
      kind: CLINIC_TREATMENT_EMAIL_KIND.ASSIGNMENT_SYNC,
      ctx,
      clinicId: clinicTreatment.clinicId,
      clinicName: clinic?.name ?? "",
      treatmentName: clinicTreatment.treatmentName ?? "",
      clinicTreatmentId,
      addedSpecialistIds,
      removedSpecialistIds,
    });
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: "Specialist assignments synced successfully",
      items: items.map(toClinicSpecialistTreatmentDto).filter(Boolean),
      clinicTreatmentId,
    },
  };
};

export const listClinicSpecialistTreatments = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.TREATMENT.CLINIC_SPECIALIST_TREATMENT_LIST,
    normalizeRequest(ctx.reqBody ?? {}),
  );
  const filters = resolveClinicSpecialistTreatmentListFilters(
    ctx.routeKey,
    query.filters ?? {},
  );
  const scopedQuery = { ...query, filters };
  const indexAlias = `clinic_specialist_treatments-${ctx.env}`;

  const { items, total, nextToken } = await searchClinicSpecialistTreatments({
    opsClient: ctx.opsClient,
    query: scopedQuery,
    indexAlias,
    publicBrowse: isPublicRoute(ctx.routeKey),
  });

  return {
    statusCode: 200,
    data: {
      ...(!items.length ? { message: "No data found" } : {}),
      items: items.map(toClinicSpecialistTreatmentDto).filter(Boolean),
      total,
      nextToken,
      success: items.length > 0,
    },
  };
};
