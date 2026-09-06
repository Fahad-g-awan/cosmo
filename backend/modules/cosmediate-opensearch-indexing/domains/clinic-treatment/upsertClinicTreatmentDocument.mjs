import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

export const upsertClinicTreatmentDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const row = await prisma.clinicTreatment.findUnique({
      where: { id: entityId },
    });

    if (!row) {
      throw new Error(`Clinic treatment not found: ${entityId}`);
    }

    const indexPayload = {
      id: row.id,
      entityType: row.entityType,
      clinicId: row.clinicId,
      treatmentId: row.treatmentId,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      treatmentName: row.treatmentName,
      treatmentImage: row.treatmentImage,
      treatmentOverview: row.treatmentOverview,
      status: row.status,
      avgPrice: row.avgPrice ?? 0,
      minPrice: row.minPrice ?? 0,
      maxPrice: row.maxPrice ?? 0,
      deleted: row.deleted,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return runIndexPipeline(indexPayload, { indexAlias, entityType });
  } catch (error) {
    console.error("[upsertClinicTreatmentDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Clinic treatment indexing failed",
      details: ["Clinic treatment indexing failed"],
    });
  }
};
