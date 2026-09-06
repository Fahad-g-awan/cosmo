import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  loadTreatmentAggregateCounts,
  loadTreatmentBrandIds,
  loadTreatmentPriceRollup,
} from "/opt/nodejs/services/prisma/org/treatment/treatment-price-aggregates.mjs";
import { reindexTreatmentCategoryDocument } from "../../lib/helpers/reindex-category-aggregates.mjs";
import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

export const upsertTreatmentDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const treatment = await prisma.treatment.findUnique({
      where: { id: entityId },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!treatment) {
      throw new Error(`Treatment not found: ${entityId}`);
    }

    const [{ clinicCount, specialistCount }, prices, brandIds] =
      await Promise.all([
        loadTreatmentAggregateCounts(prisma, entityId),
        loadTreatmentPriceRollup(prisma, entityId),
        loadTreatmentBrandIds(prisma, entityId),
      ]);

    const { category, ...fields } = treatment;
    const indexPayload = {
      ...fields,
      categoryName: category?.name ?? null,
      clinicCount,
      specialistCount,
      brandIds,
      ...prices,
    };

    const result = await runIndexPipeline(indexPayload, {
      indexAlias,
      entityType,
    });

    if (treatment.categoryId) {
      await reindexTreatmentCategoryDocument(treatment.categoryId);
    }

    return result;
  } catch (error) {
    console.error("[upsertTreatmentDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Treatment indexing failed",
      details: ["Treatment indexing failed"],
    });
  }
};
