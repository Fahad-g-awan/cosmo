import Ajv from "ajv";
import addFormats from "ajv-formats";
import ajvErrors from "ajv-errors";

export const ajv = new Ajv({
  allErrors: true,
  strict: true,
  // removeAdditional: "failing", // or "all" to strip unknowns
  useDefaults: true,
  coerceTypes: true,
});
addFormats(ajv);
ajvErrors(ajv);
