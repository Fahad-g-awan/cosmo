import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

export const upsertReviewReplyDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const reply = await prisma.reviewReply.findUnique({
      where: { id: entityId },
    });
    if (!reply) {
      throw new Error(`Review reply not found: ${entityId}`);
    }

    return runIndexPipeline(reply, {
      indexAlias,
      entityType,
    });
  } catch (error) {
    console.error("[upsertReviewReplyDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Review reply indexing failed",
      details: ["Review reply indexing failed"],
    });
  }
};
