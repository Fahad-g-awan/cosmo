import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

/** Load announcement from Postgres and index or update the OpenSearch document. */
export const upsertAnnouncementDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const announcement = await prisma.announcement.findUnique({
      where: { id: entityId },
    });

    if (!announcement) {
      throw new Error(`Announcement not found: ${entityId}`);
    }

    return runIndexPipeline(announcement, {
      indexAlias,
      entityType,
    });
  } catch (error) {
    console.error("[upsertAnnouncementDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Announcement indexing failed",
      details: ["Announcement indexing failed"],
    });
  }
};
