import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import {
  indexSearchDocument,
  updateSearchDocument,
  removeSearchDocument,
} from "../opensearch/writers.mjs";

export const runIndexPipeline = async (
  data,
  { indexAlias, entityType, option = "single", action = "" },
) => {
  try {
    const context = getRequestContext();
    const { detailType, opsClient } = context;
    const eventAction = action || detailType;

    switch (eventAction) {
      case DB_EVENT.INSERT:
        return indexSearchDocument({
          opsClient,
          indexAlias,
          entityType,
          data,
          option,
        });

      case DB_EVENT.UPDATE:
      case DB_EVENT.SOFT_DELETE:
        return updateSearchDocument({
          opsClient,
          indexAlias,
          entityType,
          data,
          option,
        });

      case DB_EVENT.DELETE:
        return removeSearchDocument({ opsClient, indexAlias, data });

      default:
        console.log("[runIndexPipeline] Skip: unknown event type", detailType);
        return { result: "skipped", message: "unknown event type" };
    }
  } catch (error) {
    console.error("[runIndexPipeline] Error", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Index pipeline failed",
    });
  }
};
