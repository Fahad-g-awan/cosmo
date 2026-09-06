import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { persistSpecialistPriceAggregatesForIds } from "./price-aggregate-cascade.mjs";

/**
 * Active clinic + distinct specialist counts for a master treatment (browse + OS doc).
 */
export const loadTreatmentAggregateCounts = async (prisma, treatmentId) => {
  if (!treatmentId) {
    return { clinicCount: 0, specialistCount: 0 };
  }

  const [clinicGroups, specialistGroups] = await Promise.all([
    prisma.clinicTreatment.groupBy({
      by: ["clinicId"],
      where: { treatmentId, deleted: false, status: "ACTIVE" },
    }),
    prisma.clinicSpecialistTreatment.groupBy({
      by: ["specialistId"],
      where: { treatmentId, deleted: false, status: "ACTIVE" },
    }),
  ]);

  return {
    clinicCount: clinicGroups.length,
    specialistCount: specialistGroups.length,
  };
};

const emitIndexEvent = async (eventBusName, env, entityId, entityType, action) => {
  if (!entityId || !entityType || !action) return;

  await emitEvent(eventBusName, action, {
    schemaVersion: "1",
    entityId,
    entityType,
    ENV: env,
  });
};

/** INSERT for new hub rows; UPDATE for re-activate, denorm refresh, or deactivation. */
export const emitClinicTreatmentIndexEvents = async ({
  eventBusName,
  env,
  createdIds = [],
  updatedIds = [],
}) => {
  for (const entityId of [...new Set(createdIds)].filter(Boolean)) {
    await emitIndexEvent(
      eventBusName,
      env,
      entityId,
      ENTITY_TYPE.CLINIC_TREATMENT,
      DB_EVENT.INSERT,
    );
  }

  for (const entityId of [...new Set(updatedIds)].filter(Boolean)) {
    await emitIndexEvent(
      eventBusName,
      env,
      entityId,
      ENTITY_TYPE.CLINIC_TREATMENT,
      DB_EVENT.UPDATE,
    );
  }
};

/**
 * Refresh sub-treatment and treatment-result docs when hub status/denorm changes
 * (clinicTreatmentStatus on child index documents).
 */
export const emitHubChildDocumentUpdates = async ({
  prisma,
  eventBusName,
  env,
  clinicTreatmentIds = [],
}) => {
  const hubIds = [...new Set(clinicTreatmentIds)].filter(Boolean);
  if (!hubIds.length) return;

  const [subTreatments, treatmentResults] = await Promise.all([
    prisma.subTreatment.findMany({
      where: { clinicTreatmentId: { in: hubIds }, deleted: false },
      select: { id: true },
    }),
    prisma.treatmentResult.findMany({
      where: { clinicTreatmentId: { in: hubIds }, deleted: false },
      select: { id: true },
    }),
  ]);

  for (const row of subTreatments) {
    await emitIndexEvent(
      eventBusName,
      env,
      row.id,
      ENTITY_TYPE.SUB_TREATMENT,
      DB_EVENT.UPDATE,
    );
  }

  for (const row of treatmentResults) {
    await emitIndexEvent(
      eventBusName,
      env,
      row.id,
      ENTITY_TYPE.TREATMENT_RESULT,
      DB_EVENT.UPDATE,
    );
  }
};

export const emitTreatmentReindex = async ({
  eventBusName,
  env,
  treatmentIds = [],
}) => {
  for (const treatmentId of [...new Set(treatmentIds)].filter(Boolean)) {
    await emitIndexEvent(
      eventBusName,
      env,
      treatmentId,
      ENTITY_TYPE.TREATMENT,
      DB_EVENT.UPDATE,
    );
  }
};

export const emitSpecialistReindex = async ({
  eventBusName,
  env,
  specialistIds = [],
}) => {
  for (const specialistId of [...new Set(specialistIds)].filter(Boolean)) {
    await emitIndexEvent(
      eventBusName,
      env,
      specialistId,
      ENTITY_TYPE.SPECIALIST,
      DB_EVENT.UPDATE,
    );
  }
};

export const emitTreatmentReindexForAssignments = async ({
  prisma,
  eventBusName,
  env,
  assignmentIds = [],
}) => {
  const ids = [...new Set(assignmentIds)].filter(Boolean);
  if (!ids.length) return;

  const rows = await prisma.clinicSpecialistTreatment.findMany({
    where: { id: { in: ids } },
    select: { treatmentId: true },
  });

  await emitTreatmentReindex({
    eventBusName,
    env,
    treatmentIds: rows.map((row) => row.treatmentId),
  });
};

export const refreshSpecialistPricesForAssignments = async ({
  prisma,
  eventBusName,
  env,
  assignmentIds = [],
}) => {
  const ids = [...new Set(assignmentIds)].filter(Boolean);
  if (!ids.length) return;

  const rows = await prisma.clinicSpecialistTreatment.findMany({
    where: { id: { in: ids } },
    select: { specialistId: true },
  });
  const specialistIds = [...new Set(rows.map((row) => row.specialistId))];

  await persistSpecialistPriceAggregatesForIds(prisma, specialistIds);
  await emitSpecialistReindex({ eventBusName, env, specialistIds });
};

/**
 * After sub-treatment price rollup, reindex hub offering, clinic, treatment master,
 * active assignments (brandIds / price denorm), and affected specialists.
 */
export const reindexHubAggregateFanout = async ({
  prisma,
  eventBusName,
  env,
  clinicTreatmentId,
}) => {
  if (!clinicTreatmentId) return;

  const hub = await prisma.clinicTreatment.findUnique({
    where: { id: clinicTreatmentId },
    select: { id: true, clinicId: true, treatmentId: true },
  });
  if (!hub) return;

  await emitIndexEvent(
    eventBusName,
    env,
    hub.id,
    ENTITY_TYPE.CLINIC_TREATMENT,
    DB_EVENT.UPDATE,
  );
  await emitIndexEvent(
    eventBusName,
    env,
    hub.clinicId,
    ENTITY_TYPE.CLINIC,
    DB_EVENT.UPDATE,
  );
  await emitIndexEvent(
    eventBusName,
    env,
    hub.treatmentId,
    ENTITY_TYPE.TREATMENT,
    DB_EVENT.UPDATE,
  );

  const assignments = await prisma.clinicSpecialistTreatment.findMany({
    where: {
      clinicTreatmentId,
      deleted: false,
      status: "ACTIVE",
    },
    select: { id: true, specialistId: true },
  });

  for (const row of assignments) {
    await emitIndexEvent(
      eventBusName,
      env,
      row.id,
      ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT,
      DB_EVENT.UPDATE,
    );
  }

  for (const specialistId of [
    ...new Set(assignments.map((row) => row.specialistId)),
  ]) {
    await emitIndexEvent(
      eventBusName,
      env,
      specialistId,
      ENTITY_TYPE.SPECIALIST,
      DB_EVENT.UPDATE,
    );
  }
};

/** @deprecated Use reindexHubAggregateFanout */
export const reindexTreatmentAggregatesForClinicTreatment = reindexHubAggregateFanout;
