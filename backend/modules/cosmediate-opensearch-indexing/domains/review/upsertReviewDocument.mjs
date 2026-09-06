import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { reindexReviewTargetDocument } from "../../lib/helpers/reindex-review-target.mjs";
import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

export const upsertReviewDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma, commands } =
      getRequestContext();

    const review = await prisma.review.findUnique({
      where: { id: entityId },
    });
    if (!review) {
      throw new Error(`Review not found: ${entityId}`);
    }

    const result = await runIndexPipeline(review, {
      indexAlias,
      entityType,
    });

    if (!commands?.isReplyCountUpdate) {
      await reindexReviewTargetDocument(
        review.targetEntityType,
        review.targetEntityId,
      );
    }

    return result;
  } catch (error) {
    console.error("[upsertReviewDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Review indexing failed",
      details: ["Review indexing failed"],
    });
  }
};
