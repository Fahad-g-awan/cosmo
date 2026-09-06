import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { runIndexPipeline } from "../pipeline/run-index-pipeline.mjs";
import { aliasFor } from "../opensearch/documents.mjs";
import { ENTITY_TO_BASE } from "../constants.mjs";

/**
 * Re-indexes one clinic category document (e.g. after clinic category link changes).
 *
 * @param {string} categoryId
 */
export const reindexClinicCategoryDocument = async (categoryId) => {
  const { env, prisma } = getRequestContext();
  if (!categoryId) return null;

  const category = await prisma.clinicCategory.findUnique({
    where: { id: categoryId },
  });
  if (!category) return null;

  const clinicCount = await prisma.clinicCategoryLink.count({
    where: {
      categoryId,
      clinic: { deleted: false },
    },
  });

  return runIndexPipeline(
    { ...category, clinicCount },
    {
      indexAlias: aliasFor(ENTITY_TO_BASE[ENTITY_TYPE.CLINIC_CATEGORY], env),
      entityType: ENTITY_TYPE.CLINIC_CATEGORY,
      action: DB_EVENT.UPDATE,
    },
  );
};
