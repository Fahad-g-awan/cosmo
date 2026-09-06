import { ENTITY_TYPE } from "./entity-types.mjs";

/**
 * ENTITY_TYPE values valid for platform log `scope` / audit `entity` filters.
 */
export const LOG_SCOPE_ENTITY_TYPES = Object.freeze(
  Object.values(ENTITY_TYPE).filter(
    (value) =>
      value !== ENTITY_TYPE.AUDIT_LOG &&
      value !== ENTITY_TYPE.ACTIVITY_MONITORING &&
      value !== ENTITY_TYPE.SESSION &&
      value !== ENTITY_TYPE.WEBSOCKET_CONNECTION &&
      value !== ENTITY_TYPE.ENTITY_SEARCH_STATS &&
      value !== ENTITY_TYPE.OAUTH_CONTEXT &&
      value !== ENTITY_TYPE.OAUTH_CLIENT_APP,
  ),
);
