import {
  getRequestContext,
  useRequestContext,
} from "/opt/nodejs/lib/context/request-context.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { upsertSpecialistDocument } from "../../domains/specialist/upsertSpecialistDocument.mjs";
import { upsertClinicDocument } from "../../domains/clinic/upsertClinicDocument.mjs";
import { aliasFor } from "../opensearch/documents.mjs";
import { ENTITY_TO_BASE } from "../constants.mjs";

/**
 * Re-index the clinic or specialist that a review targets (refreshes avgRating in OpenSearch).
 *
 * @param {"CLINIC"|"SPECIALIST"} targetEntityType
 * @param {string} targetEntityId
 */
export const reindexReviewTargetDocument = async (
  targetEntityType,
  targetEntityId,
) => {
  if (!targetEntityType || !targetEntityId) return null;

  const parentCtx = getRequestContext();
  const entityType =
    targetEntityType === "CLINIC" ? ENTITY_TYPE.CLINIC : ENTITY_TYPE.SPECIALIST;
  const base = ENTITY_TO_BASE[entityType];
  if (!base) return null;

  return useRequestContext(
    {
      ...parentCtx,
      entityId: targetEntityId,
      entityType,
      indexAlias: aliasFor(base, parentCtx.env),
      detailType: DB_EVENT.UPDATE,
    },
    async () => {
      if (targetEntityType === "CLINIC") {
        return upsertClinicDocument();
      }
      return upsertSpecialistDocument();
    },
  );
};
