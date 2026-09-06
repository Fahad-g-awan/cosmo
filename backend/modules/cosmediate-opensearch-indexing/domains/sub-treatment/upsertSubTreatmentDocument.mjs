import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

const collectBrandIdsForSubTreatment = async (prisma, subTreatmentId) => {
  const rows = await prisma.subTreatmentBrand.findMany({
    where: { subTreatmentId },
    select: { brandId: true },
  });

  return [...new Set(rows.map((row) => row.brandId))];
};

export const upsertSubTreatmentDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const row = await prisma.subTreatment.findUnique({
      where: { id: entityId },
      include: {
        clinicTreatment: {
          select: { id: true, status: true },
        },
      },
    });

    if (!row) {
      throw new Error(`Sub-treatment not found: ${entityId}`);
    }

    const brandIds = await collectBrandIdsForSubTreatment(prisma, entityId);

    const indexPayload = {
      id: row.id,
      entityType: row.entityType,
      clinicTreatmentId: row.clinicTreatmentId,
      clinicId: row.clinicId,
      treatmentId: row.treatmentId,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      clinicTreatmentStatus: row.clinicTreatment?.status ?? null,
      name: row.name,
      price: row.price,
      duration: row.duration,
      available: row.available,
      brandIds,
      deleted: row.deleted,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return runIndexPipeline(indexPayload, { indexAlias, entityType });
  } catch (error) {
    console.error("[upsertSubTreatmentDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Sub-treatment indexing failed",
      details: ["Sub-treatment indexing failed"],
    });
  }
};
