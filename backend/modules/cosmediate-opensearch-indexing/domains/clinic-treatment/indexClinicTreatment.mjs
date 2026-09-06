import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { upsertClinicTreatmentDocument } from "./upsertClinicTreatmentDocument.mjs";

const WRITE_EVENTS = new Set([
  DB_EVENT.INSERT,
  DB_EVENT.UPDATE,
  DB_EVENT.SOFT_DELETE,
]);

export const indexClinicTreatment = async () => {
  const { detailType } = getRequestContext();

  if (!WRITE_EVENTS.has(detailType)) {
    return { message: "[indexClinicTreatment] Unknown event", detailType };
  }

  return upsertClinicTreatmentDocument();
};
