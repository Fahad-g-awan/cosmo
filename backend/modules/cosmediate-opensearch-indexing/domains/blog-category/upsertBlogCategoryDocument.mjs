import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

export const upsertBlogCategoryDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const category = await prisma.blogCategory.findUnique({
      where: { id: entityId },
    });
    if (!category) {
      throw new Error(`Blog category not found: ${entityId}`);
    }

    const blogCount = await prisma.blog.count({
      where: { categoryId: entityId, deleted: false },
    });

    return runIndexPipeline(
      { ...category, blogCount },
      { indexAlias, entityType },
    );
  } catch (error) {
    console.error("[upsertBlogCategoryDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Blog category indexing failed",
      details: ["Blog category indexing failed"],
    });
  }
};
