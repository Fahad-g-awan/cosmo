import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  indexEntitySearchStatRecord,
  patchClinicSpecialistTreatmentSearchClicksByTreatmentId,
  patchTargetEntitySearchClicks,
} from "./entity-search-stat.helpers.mjs";

export const recordEntitySearchClick = async () => {
  try {
    const { prisma, opsClient, env, searchStats } = getRequestContext();

    const { targetEntityType, targetEntityId } = searchStats ?? {};
    if (!targetEntityId || !targetEntityType) {
      throw new Error("targetEntityId and targetEntityType are required");
    }

    const stat = await prisma.entitySearchStat.upsert({
      where: {
        targetEntityType_targetEntityId: { targetEntityType, targetEntityId },
      },
      create: {
        targetEntityType,
        targetEntityId,
        entityType: ENTITY_TYPE.ENTITY_SEARCH_STATS,
        searchClicks: 1,
      },
      update: {
        searchClicks: { increment: 1 },
      },
    });

    const statIndexResult = await indexEntitySearchStatRecord({
      opsClient,
      env,
      stat,
    });

    const targetPatchResult = await patchTargetEntitySearchClicks({
      opsClient,
      env,
      targetEntityType,
      targetEntityId,
      searchClicks: stat.searchClicks,
    });

    const cstPatchResult =
      targetEntityType === ENTITY_TYPE.TREATMENT
        ? await patchClinicSpecialistTreatmentSearchClicksByTreatmentId({
            opsClient,
            env,
            treatmentId: targetEntityId,
            searchClicks: stat.searchClicks,
          })
        : { result: "skipped" };

    return {
      statIndexResult,
      targetPatchResult,
      cstPatchResult,
      searchClicks: stat.searchClicks,
    };
  } catch (error) {
    console.error("[recordEntitySearchClick]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Entity search click indexing failed",
      details: ["Entity search click indexing failed"],
    });
  }
};
