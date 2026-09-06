import { normalizeRequest } from "../http/normalize-request.mjs";
import { validateApiRequest } from "./ajv/api-validator.mjs";

/**
 * @param {string} apiAction - CRUD_ACTIONS.* value
 * @param {unknown} body
 * @returns {{ ok: true, value: object }}
 */
export const validateRequestBody = (apiAction, body) => {
  const normalized = normalizeRequest(body);
  return validateApiRequest(apiAction, normalized);
};
