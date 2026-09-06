import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

export const upsertTreatmentBrandDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const brand = await prisma.treatmentBrand.findUnique({
      where: { id: entityId },
    });
    if (!brand) {
      throw new Error(`Treatment brand not found: ${entityId}`);
    }

    return runIndexPipeline(brand, { indexAlias, entityType });
  } catch (error) {
    console.error("[upsertTreatmentBrandDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Treatment brand indexing failed",
      details: ["Treatment brand indexing failed"],
    });
  }
};
