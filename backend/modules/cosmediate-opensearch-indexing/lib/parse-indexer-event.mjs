import { aliasFor } from "./opensearch/documents.mjs";
import { ENTITY_TO_BASE } from "./constants.mjs";

/**
 * Validates EventBridge detail and resolves index alias.
 * @returns {{ ok: true, payload: object } | { ok: false, reason: string }}
 */
export const parseIndexerEvent = (event) => {
  const detailType = event["detail-type"] ?? "";
  if (!detailType) {
    return { ok: false, reason: "detail-type is missing" };
  }

  const detail = event?.detail ?? {};
  const entityId = detail.entityId ?? "";
  if (!entityId) {
    return { ok: false, reason: "entityId is missing" };
  }

  const entityType = detail.entityType ?? "";
  if (!entityType) {
    return { ok: false, reason: "entityType is missing" };
  }

  const env = detail.ENV ?? "";
  if (!env) {
    return { ok: false, reason: "ENV is missing" };
  }

  const base = ENTITY_TO_BASE[entityType];
  if (!base) {
    return { ok: false, reason: `unsupported entityType: ${entityType}` };
  }

  return {
    ok: true,
    payload: {
      detailType,
      entityId,
      entityType,
      env,
      indexAlias: aliasFor(base, env),
    },
  };
};
