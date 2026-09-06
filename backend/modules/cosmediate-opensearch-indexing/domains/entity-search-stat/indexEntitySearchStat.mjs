import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import { recordEntitySearchClick } from "./recordEntitySearchClick.mjs";

export const indexEntitySearchStat = async () => {
  const { detailType } = getRequestContext();

  if (detailType !== DB_EVENT.SEARCH_CLICK) {
    return { message: "[indexEntitySearchStat] Unknown event", detailType };
  }

  return recordEntitySearchClick();
};
