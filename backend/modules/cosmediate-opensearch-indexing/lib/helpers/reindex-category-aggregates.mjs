import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { aliasFor } from "../opensearch/documents.mjs";
import { ENTITY_TO_BASE } from "../constants.mjs";
import { runIndexPipeline } from "../pipeline/run-index-pipeline.mjs";

export const reindexTreatmentCategoryDocument = async (categoryId) => {
  const { env, prisma } = getRequestContext();
  if (!categoryId) return null;

  const category = await prisma.treatmentCategory.findUnique({
    where: { id: categoryId },
  });
  if (!category) return null;

  const treatmentCount = await prisma.treatment.count({
    where: { categoryId, deleted: false },
  });

  return runIndexPipeline(
    { ...category, treatmentCount },
    {
      indexAlias: aliasFor(ENTITY_TO_BASE[ENTITY_TYPE.TREATMENT_CATEGORY], env),
      entityType: ENTITY_TYPE.TREATMENT_CATEGORY,
      action: DB_EVENT.UPDATE,
    },
  );
};

export const reindexBlogCategoryDocument = async (categoryId) => {
  const { env, prisma } = getRequestContext();
  if (!categoryId) return null;

  const category = await prisma.blogCategory.findUnique({
    where: { id: categoryId },
  });
  if (!category) return null;

  const blogCount = await prisma.blog.count({
    where: { categoryId, deleted: false },
  });

  return runIndexPipeline(
    { ...category, blogCount },
    {
      indexAlias: aliasFor(ENTITY_TO_BASE[ENTITY_TYPE.BLOG_CATEGORY], env),
      entityType: ENTITY_TYPE.BLOG_CATEGORY,
      action: DB_EVENT.UPDATE,
    },
  );
};
