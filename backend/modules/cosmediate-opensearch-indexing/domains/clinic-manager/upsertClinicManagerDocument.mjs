import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { mergeIdentityForSearchDoc } from "../../lib/opensearch/documents.mjs";
import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";
import { IDENTITY_SEARCH_SELECT } from "../../lib/identity-select.mjs";

/**
 * Loads a clinic manager, merges identity auth fields, denormalizes clinicIds[],
 * and upserts the OpenSearch document.
 */
export const upsertClinicManagerDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const clinicManager = await prisma.clinicManager.findUnique({
      where: { id: entityId },
      include: {
        identity: { select: IDENTITY_SEARCH_SELECT },
        clinics: { select: { clinicId: true } },
      },
    });

    if (!clinicManager) {
      throw new Error(`Clinic manager not found: ${entityId}`);
    }

    const { identity, clinics, ...managerFields } = clinicManager;
    const clinicIds = clinics.map((link) => link.clinicId);

    const indexPayload = mergeIdentityForSearchDoc(
      {
        ...managerFields,
        clinicIds,
        clinicCount: clinicIds.length,
      },
      identity,
    );

    return runIndexPipeline(indexPayload, { indexAlias, entityType });
  } catch (error) {
    console.error("[upsertClinicManagerDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Clinic manager indexing failed",
      details: ["Clinic manager indexing failed"],
    });
  }
};
