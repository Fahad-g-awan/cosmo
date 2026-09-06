import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { reindexBlogCategoryDocument } from "../../lib/helpers/reindex-category-aggregates.mjs";
import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

export const upsertBlogDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma, opsClient } =
      getRequestContext();

    let previousCategoryId = null;
    try {
      const existing = await opsClient.get({ index: indexAlias, id: entityId });
      previousCategoryId = existing.body?._source?.categoryId ?? null;
    } catch (error) {
      if (error?.meta?.statusCode !== 404) throw error;
    }

    const blog = await prisma.blog.findUnique({
      where: { id: entityId },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!blog) {
      throw new Error(`Blog not found: ${entityId}`);
    }

    const { category, ...fields } = blog;
    const indexPayload = {
      ...fields,
      categoryName: category?.name ?? null,
    };

    const result = await runIndexPipeline(indexPayload, {
      indexAlias,
      entityType,
    });

    if (blog.categoryId) {
      await reindexBlogCategoryDocument(blog.categoryId);
    }

    if (previousCategoryId && previousCategoryId !== blog.categoryId) {
      await reindexBlogCategoryDocument(previousCategoryId);
    }

    return result;
  } catch (error) {
    console.error("[upsertBlogDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Blog indexing failed",
      details: ["Blog indexing failed"],
    });
  }
};
