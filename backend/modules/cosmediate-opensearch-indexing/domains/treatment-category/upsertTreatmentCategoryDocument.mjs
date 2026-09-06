import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

export const upsertTreatmentCategoryDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const category = await prisma.treatmentCategory.findUnique({
      where: { id: entityId },
    });
    if (!category) {
      throw new Error(`Treatment category not found: ${entityId}`);
    }

    const treatmentCount = await prisma.treatment.count({
      where: { categoryId: entityId, deleted: false },
    });

    return runIndexPipeline(
      { ...category, treatmentCount },
      { indexAlias, entityType },
    );
  } catch (error) {
    console.error("[upsertTreatmentCategoryDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Treatment category indexing failed",
      details: ["Treatment category indexing failed"],
    });
  }
};
