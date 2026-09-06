import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { upsertTreatmentCategoryDocument } from "./upsertTreatmentCategoryDocument.mjs";

const WRITE_EVENTS = new Set([
  DB_EVENT.INSERT,
  DB_EVENT.UPDATE,
  DB_EVENT.SOFT_DELETE,
]);

export const indexTreatmentCategory = async () => {
  const { detailType } = getRequestContext();

  if (!WRITE_EVENTS.has(detailType)) {
    return { message: "[indexTreatmentCategory] Unknown event", detailType };
  }

  return upsertTreatmentCategoryDocument();
};
