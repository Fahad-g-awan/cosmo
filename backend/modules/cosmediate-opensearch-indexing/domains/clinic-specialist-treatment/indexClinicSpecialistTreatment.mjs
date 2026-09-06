import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { upsertClinicSpecialistTreatmentDocument } from "./upsertClinicSpecialistTreatmentDocument.mjs";

const WRITE_EVENTS = new Set([
  DB_EVENT.INSERT,
  DB_EVENT.UPDATE,
  DB_EVENT.SOFT_DELETE,
]);

export const indexClinicSpecialistTreatment = async () => {
  const { detailType } = getRequestContext();

  if (!WRITE_EVENTS.has(detailType)) {
    return {
      message: "[indexClinicSpecialistTreatment] Unknown event",
      detailType,
    };
  }

  return upsertClinicSpecialistTreatmentDocument();
};
