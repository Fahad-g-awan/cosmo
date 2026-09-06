import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { reindexClinicCategoryDocument } from "../../lib/helpers/reindex-clinic-category-aggregates.mjs";
import { loadClinicTreatmentFacets } from "/opt/nodejs/services/prisma/org/treatment/treatment-price-aggregates.mjs";
import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

/**
 * Loads a clinic, denormalizes link-table arrays + hub treatment facets, indexes
 * OpenSearch, and refreshes affected clinic category aggregate docs.
 */
export const upsertClinicDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const clinic = await prisma.clinic.findUnique({ where: { id: entityId } });
    if (!clinic) {
      throw new Error(`Clinic not found: ${entityId}`);
    }

    const [managerLinks, specialistLinks, categoryLinks, treatmentFacets] =
      await Promise.all([
        prisma.clinicManagerLink.findMany({
          where: { clinicId: entityId },
          select: { managerId: true },
        }),
        prisma.clinicSpecialistLink.findMany({
          where: { clinicId: entityId, status: "ACTIVE" },
          select: { specialistId: true },
        }),
        prisma.clinicCategoryLink.findMany({
          where: { clinicId: entityId },
          include: { category: { select: { id: true, name: true } } },
        }),
        loadClinicTreatmentFacets(prisma, entityId),
      ]);

    const managerIds = managerLinks.map((l) => l.managerId);
    const specialistIds = specialistLinks.map((l) => l.specialistId);
    const categories = categoryLinks.map((l) => ({
      id: l.category.id,
      name: l.category.name,
    }));
    const categoryIds = categories.map((c) => c.id);

    const clinicPayload = {
      ...clinic,
      managerIds,
      specialistIds,
      categories,
      categoryIds,
      managerCount: managerIds.length,
      specialistCount: specialistIds.length,
      treatmentCount: treatmentFacets.treatmentCount,
      clinicTreatmentCount: treatmentFacets.clinicTreatmentCount,
      treatmentIds: treatmentFacets.treatmentIds,
      treatmentCategoryIds: treatmentFacets.treatmentCategoryIds,
      clinicTreatmentIds: treatmentFacets.clinicTreatmentIds,
      clinicSpecialistTreatmentIds:
        treatmentFacets.clinicSpecialistTreatmentIds,
      brandIds: treatmentFacets.brandIds,
      minPrice: treatmentFacets.minPrice,
      maxPrice: treatmentFacets.maxPrice,
      avgPrice: treatmentFacets.avgPrice,
      facetSearchTerms: treatmentFacets.facetSearchTerms,
    };

    const result = await runIndexPipeline(clinicPayload, {
      indexAlias,
      entityType,
    });

    for (const categoryId of categoryIds) {
      await reindexClinicCategoryDocument(categoryId);
    }

    return result;
  } catch (error) {
    console.error("[upsertClinicDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Clinic indexing failed",
      details: ["Clinic indexing failed"],
    });
  }
};
