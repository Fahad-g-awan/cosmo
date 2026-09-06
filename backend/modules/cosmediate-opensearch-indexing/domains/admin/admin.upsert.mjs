import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { mergeIdentityForSearchDoc } from "../../lib/opensearch/documents.mjs";
import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";
import { IDENTITY_SEARCH_SELECT } from "../../lib/identity-select.mjs";

export const upsertAdminSearchDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const foundAdmin = await prisma.admin.findUnique({
      where: { id: entityId },
      include: { identity: { select: IDENTITY_SEARCH_SELECT } },
    });

    if (!foundAdmin) {
      throw new Error(`Admin not found: ${entityId}`);
    }

    const { identity, ...adminFields } = foundAdmin;
    const indexPayload = mergeIdentityForSearchDoc(adminFields, identity);

    return runIndexPipeline(indexPayload, { indexAlias, entityType });
  } catch (error) {
    console.error("[upsertAdminSearchDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Admin search indexing failed",
      details: ["Admin search indexing failed"],
    });
  }
};
