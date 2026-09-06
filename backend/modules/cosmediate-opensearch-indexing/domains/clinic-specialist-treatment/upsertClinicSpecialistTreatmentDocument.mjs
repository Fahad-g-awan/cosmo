import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

const collectBrandIdsForClinicTreatment = async (prisma, clinicTreatmentId) => {
  const rows = await prisma.subTreatmentBrand.findMany({
    where: {
      subTreatment: {
        clinicTreatmentId,
        deleted: false,
      },
    },
    select: { brandId: true },
  });

  return [...new Set(rows.map((row) => row.brandId))];
};

export const upsertClinicSpecialistTreatmentDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const assignment = await prisma.clinicSpecialistTreatment.findUnique({
      where: { id: entityId },
      include: {
        clinicTreatment: {
          select: {
            id: true,
            status: true,
            avgPrice: true,
            minPrice: true,
            maxPrice: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new Error(`Clinic specialist treatment not found: ${entityId}`);
    }

    const brandIds = await collectBrandIdsForClinicTreatment(
      prisma,
      assignment.clinicTreatmentId,
    );

    const searchStat = assignment.treatmentId
      ? await prisma.entitySearchStat.findUnique({
          where: {
            targetEntityType_targetEntityId: {
              targetEntityType: ENTITY_TYPE.TREATMENT,
              targetEntityId: assignment.treatmentId,
            },
          },
          select: { searchClicks: true },
        })
      : null;

    const indexPayload = {
      id: assignment.id,
      entityType: assignment.entityType,
      clinicTreatmentId: assignment.clinicTreatmentId,
      clinicId: assignment.clinicId,
      specialistId: assignment.specialistId,
      treatmentId: assignment.treatmentId,
      categoryId: assignment.categoryId,
      categoryName: assignment.categoryName,
      treatmentName: assignment.treatmentName,
      treatmentImage: assignment.treatmentImage,
      treatmentOverview: assignment.treatmentOverview,
      specialistExperience: assignment.specialistExperience,
      status: assignment.status,
      clinicTreatmentStatus: assignment.clinicTreatment?.status ?? null,
      available: assignment.available,
      brandIds,
      avgPrice: assignment.clinicTreatment?.avgPrice ?? 0,
      minPrice: assignment.clinicTreatment?.minPrice ?? 0,
      maxPrice: assignment.clinicTreatment?.maxPrice ?? 0,
      searchClicks: searchStat?.searchClicks ?? 0,
      deleted: assignment.deleted,
      deletedAt: assignment.deletedAt,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    };

    return runIndexPipeline(indexPayload, { indexAlias, entityType });
  } catch (error) {
    console.error("[upsertClinicSpecialistTreatmentDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_SERVER_ERROR,
      details: [error.message],
    });
  }
};
