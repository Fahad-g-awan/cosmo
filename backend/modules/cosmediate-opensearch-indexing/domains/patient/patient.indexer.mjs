import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { upsertPatientSearchDocument } from "./patient.upsert.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

const WRITE_EVENTS = new Set([
  DB_EVENT.INSERT,
  DB_EVENT.UPDATE,
  DB_EVENT.SOFT_DELETE,
]);

export const indexPatient = async () => {
  const { detailType } = getRequestContext();

  if (!WRITE_EVENTS.has(detailType)) {
    return { message: "[indexPatient] Unknown event", detailType };
  }

  return upsertPatientSearchDocument();
};
