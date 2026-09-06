import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { buildClinicTreatmentDenormFromTreatment } from "./clinic-treatment-denorm.mjs";

const buildChildDenorm = (denorm) => ({
  categoryId: denorm.categoryId,
  categoryName: denorm.categoryName,
  treatmentName: denorm.treatmentName,
  treatmentImage: denorm.treatmentImage,
  treatmentOverview: denorm.treatmentOverview,
});

/**
 * Batch-refresh denorm columns on hub children when master Treatment changes.
 * Emits reindex events for affected entities.
 */
export const cascadeTreatmentDenormFields = async ({
  prisma,
  eventBusName,
  env,
  treatmentId,
}) => {
  if (!treatmentId) return;

  const treatment = await prisma.treatment.findFirst({
    where: { id: treatmentId, deleted: false },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!treatment) return;

  const denorm = buildClinicTreatmentDenormFromTreatment(treatment);
  const childDenorm = buildChildDenorm(denorm);

  await prisma.$transaction([
    prisma.clinicTreatment.updateMany({
      where: { treatmentId, deleted: false },
      data: denorm,
    }),
    prisma.clinicSpecialistTreatment.updateMany({
      where: { treatmentId, deleted: false },
      data: childDenorm,
    }),
    prisma.subTreatment.updateMany({
      where: { treatmentId, deleted: false },
      data: {
        categoryId: childDenorm.categoryId,
        categoryName: childDenorm.categoryName,
      },
    }),
    prisma.treatmentResult.updateMany({
      where: { treatmentId, deleted: false },
      data: {
        categoryId: childDenorm.categoryId,
        categoryName: childDenorm.categoryName,
      },
    }),
  ]);

  const [clinicTreatments, assignments, subTreatments, results] =
    await Promise.all([
      prisma.clinicTreatment.findMany({
        where: { treatmentId, deleted: false },
        select: { id: true },
      }),
      prisma.clinicSpecialistTreatment.findMany({
        where: { treatmentId, deleted: false },
        select: { id: true },
      }),
      prisma.subTreatment.findMany({
        where: { treatmentId, deleted: false },
        select: { id: true },
      }),
      prisma.treatmentResult.findMany({
        where: { treatmentId, deleted: false },
        select: { id: true },
      }),
    ]);

  const emit = async (entityId, entityType) => {
    await emitEvent(eventBusName, DB_EVENT.UPDATE, {
      schemaVersion: "1",
      entityId,
      entityType,
      ENV: env,
    });
  };

  for (const row of clinicTreatments) {
    await emit(row.id, ENTITY_TYPE.CLINIC_TREATMENT);
  }
  for (const row of assignments) {
    await emit(row.id, ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT);
  }
  for (const row of subTreatments) {
    await emit(row.id, ENTITY_TYPE.SUB_TREATMENT);
  }
  for (const row of results) {
    await emit(row.id, ENTITY_TYPE.TREATMENT_RESULT);
  }
};

/**
 * Refresh categoryName denorm when TreatmentCategory name changes.
 */
export const cascadeCategoryNameDenormFields = async ({
  prisma,
  eventBusName,
  env,
  categoryId,
  categoryName,
}) => {
  if (!categoryId) return;

  await prisma.$transaction([
    prisma.clinicTreatment.updateMany({
      where: { categoryId, deleted: false },
      data: { categoryName },
    }),
    prisma.clinicSpecialistTreatment.updateMany({
      where: { categoryId, deleted: false },
      data: { categoryName },
    }),
    prisma.subTreatment.updateMany({
      where: { categoryId, deleted: false },
      data: { categoryName },
    }),
    prisma.treatmentResult.updateMany({
      where: { categoryId, deleted: false },
      data: { categoryName },
    }),
  ]);

  const [clinicTreatments, assignments, subTreatments, results] =
    await Promise.all([
      prisma.clinicTreatment.findMany({
        where: { categoryId, deleted: false },
        select: { id: true },
      }),
      prisma.clinicSpecialistTreatment.findMany({
        where: { categoryId, deleted: false },
        select: { id: true },
      }),
      prisma.subTreatment.findMany({
        where: { categoryId, deleted: false },
        select: { id: true },
      }),
      prisma.treatmentResult.findMany({
        where: { categoryId, deleted: false },
        select: { id: true },
      }),
    ]);

  const emit = async (entityId, entityType) => {
    await emitEvent(eventBusName, DB_EVENT.UPDATE, {
      schemaVersion: "1",
      entityId,
      entityType,
      ENV: env,
    });
  };

  for (const row of clinicTreatments) {
    await emit(row.id, ENTITY_TYPE.CLINIC_TREATMENT);
  }
  for (const row of assignments) {
    await emit(row.id, ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT);
  }
  for (const row of subTreatments) {
    await emit(row.id, ENTITY_TYPE.SUB_TREATMENT);
  }
  for (const row of results) {
    await emit(row.id, ENTITY_TYPE.TREATMENT_RESULT);
  }
};
