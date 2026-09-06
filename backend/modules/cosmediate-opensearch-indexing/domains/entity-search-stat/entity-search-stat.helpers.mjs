import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { aliasFor } from "../../lib/opensearch/documents.mjs";
import { ENTITY_TO_BASE } from "../../lib/constants.mjs";
import {
  indexSearchDocument,
  patchSearchDocumentFields,
} from "../../lib/opensearch/writers.mjs";

const CLICK_TARGET_ENTITY_TYPES = new Set([
  ENTITY_TYPE.CLINIC,
  ENTITY_TYPE.SPECIALIST,
  ENTITY_TYPE.TREATMENT,
  ENTITY_TYPE.BLOG,
]);

export const patchClinicSpecialistTreatmentSearchClicksByTreatmentId = async ({
  opsClient,
  env,
  treatmentId,
  searchClicks,
}) => {
  if (!treatmentId || searchClicks == null) {
    return { result: "skipped", message: "missing treatmentId or searchClicks" };
  }

  const indexAlias = aliasFor(
    ENTITY_TO_BASE[ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT],
    env,
  );

  try {
    const response = await opsClient.updateByQuery({
      index: indexAlias,
      refresh: true,
      conflicts: "proceed",
      body: {
        query: {
          bool: {
            filter: [
              { term: { treatmentId } },
              { term: { deleted: false } },
            ],
          },
        },
        script: {
          source: "ctx._source.searchClicks = params.searchClicks",
          params: { searchClicks },
        },
      },
    });

    return {
      index: indexAlias,
      treatmentId,
      result: "updated",
      updated: response.body?.updated ?? 0,
    };
  } catch (error) {
    console.error(
      "[patchClinicSpecialistTreatmentSearchClicksByTreatmentId]",
      error,
    );
    return {
      index: indexAlias,
      treatmentId,
      result: "error",
      error: error?.message ?? String(error),
    };
  }
};

export const patchTargetEntitySearchClicks = async ({
  opsClient,
  env,
  targetEntityType,
  targetEntityId,
  searchClicks,
}) => {
  if (!CLICK_TARGET_ENTITY_TYPES.has(targetEntityType)) {
    console.log(
      "[patchTargetEntitySearchClicks] Unsupported target entity type",
      targetEntityType,
    );
    return { result: "skipped", message: "unsupported target entity type" };
  }

  const base = ENTITY_TO_BASE[targetEntityType];
  if (!base) {
    return { result: "skipped", message: "unknown target index base" };
  }

  return patchSearchDocumentFields({
    opsClient,
    indexAlias: aliasFor(base, env),
    docId: targetEntityId,
    fields: { searchClicks },
  });
};

export const indexEntitySearchStatRecord = async ({
  opsClient,
  env,
  stat,
}) =>
  indexSearchDocument({
    opsClient,
    indexAlias: aliasFor(
      ENTITY_TO_BASE[ENTITY_TYPE.ENTITY_SEARCH_STATS],
      env,
    ),
    entityType: ENTITY_TYPE.ENTITY_SEARCH_STATS,
    data: stat,
  });
