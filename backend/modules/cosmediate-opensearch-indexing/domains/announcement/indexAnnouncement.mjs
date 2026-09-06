import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { upsertAnnouncementDocument } from "./upsertAnnouncementDocument.mjs";

const WRITE_EVENTS = new Set([
  DB_EVENT.INSERT,
  DB_EVENT.UPDATE,
  DB_EVENT.SOFT_DELETE,
]);

/** Route EventBridge write events for announcements to the upsert indexer. */
export const indexAnnouncement = async () => {
  const { detailType } = getRequestContext();

  if (!WRITE_EVENTS.has(detailType)) {
    return { message: "[indexAnnouncement] Unknown event", detailType };
  }

  return upsertAnnouncementDocument();
};
