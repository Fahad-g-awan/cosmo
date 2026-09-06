import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { loadSpecialistTreatmentFacets } from "/opt/nodejs/services/prisma/org/treatment/treatment-price-aggregates.mjs";
import { mergeIdentityForSearchDoc } from "../../lib/opensearch/documents.mjs";
import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";
import { IDENTITY_SEARCH_SELECT } from "../../lib/identity-select.mjs";

/**
 * Loads a specialist, merges identity auth fields, denormalizes clinicIds[],
 * parentClinicId, treatment facet arrays, and upserts the OpenSearch document.
 */
export const upsertSpecialistDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const specialist = await prisma.specialist.findUnique({
      where: { id: entityId },
      include: {
        identity: { select: IDENTITY_SEARCH_SELECT },
        clinics: {
          where: {
            clinic: { deleted: false },
            status: "ACTIVE",
          },
          select: {
            clinicId: true,
            associationType: true,
            isPrimary: true,
          },
        },
      },
    });

    if (!specialist) {
      throw new Error(`Specialist not found: ${entityId}`);
    }

    const { identity, clinics, ...specialistFields } = specialist;
    const clinicLinks = clinics ?? [];
    const primaryClinicLink =
      clinicLinks.find(
        (c) => c.isPrimary && c.associationType === "FULL_TIME",
      ) ?? clinicLinks.find((c) => c.associationType === "FULL_TIME");

    const treatmentFacets = await loadSpecialistTreatmentFacets(
      prisma,
      entityId,
    );

    const indexPayload = mergeIdentityForSearchDoc(
      {
        ...specialistFields,
        parentClinicId: primaryClinicLink?.clinicId ?? "",
        clinicIds: clinicLinks.map((c) => c.clinicId),
        clinicCount: clinicLinks.length,
        treatmentCount: treatmentFacets.treatmentCount,
        treatmentIds: treatmentFacets.treatmentIds,
        treatmentCategoryIds: treatmentFacets.treatmentCategoryIds,
        clinicSpecialistTreatmentIds: treatmentFacets.clinicSpecialistTreatmentIds,
        brandIds: treatmentFacets.brandIds,
        minPrice: treatmentFacets.minPrice,
        maxPrice: treatmentFacets.maxPrice,
        avgPrice: treatmentFacets.avgPrice,
        facetSearchTerms: treatmentFacets.facetSearchTerms,
      },
      identity,
    );

    return runIndexPipeline(indexPayload, { indexAlias, entityType });
  } catch (error) {
    console.error("[upsertSpecialistDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Specialist indexing failed",
      details: ["Specialist indexing failed"],
    });
  }
};
