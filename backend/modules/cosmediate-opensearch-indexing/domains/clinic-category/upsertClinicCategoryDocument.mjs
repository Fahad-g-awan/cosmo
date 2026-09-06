import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

/**
 * Loads a clinic category and its active clinic link count, then upserts the OS document.
 */
export const upsertClinicCategoryDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const category = await prisma.clinicCategory.findUnique({
      where: { id: entityId },
    });
    if (!category) {
      throw new Error(`Clinic category not found: ${entityId}`);
    }

    const clinicCount = await prisma.clinicCategoryLink.count({
      where: {
        categoryId: entityId,
        clinic: { deleted: false },
      },
    });

    return runIndexPipeline(
      { ...category, clinicCount },
      { indexAlias, entityType },
    );
  } catch (error) {
    console.error("[upsertClinicCategoryDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Clinic category indexing failed",
      details: ["Clinic category indexing failed"],
    });
  }
};
