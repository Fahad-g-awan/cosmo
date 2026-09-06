import { getApiSchemaValidator } from "./validator-provider.mjs";
import { API_ERRORS } from "../../../constants/errors/index.mjs";
import { httpError } from "../../errors/http-error.mjs";

export const validateApiRequest = (apiAction, body) => {
  if (!body || typeof body !== "object") {
    throw httpError({
      error: API_ERRORS.INVALID_JSON_BODY,
      details: ["Request body must be a JSON object"],
    });
  }

  let validator;
  try {
    validator = getApiSchemaValidator(apiAction);
  } catch (e) {
    throw httpError({
      error: API_ERRORS.SCHEMA_ERROR,
      details: [e.message],
    });
  }

  if (!validator) {
    throw httpError({
      error: API_ERRORS.UNKNOWN_API_ACTION,
      details: [`No schema found for: ${apiAction}`],
    });
  }

  const ok = validator(body);
  if (ok) return { ok: true, value: body };

  const details = (validator.errors || []).map((e) => {
    const field = e.instancePath || e.dataPath || "(root)";
    return `${field || "(root)"} ${e.message}`;
  });

  throw httpError({ error: API_ERRORS.VALIDATION_ERROR, details });
};
