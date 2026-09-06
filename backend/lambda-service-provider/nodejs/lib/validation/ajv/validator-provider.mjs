import { API_SCHEMAS } from "../../../validation/api/schema-registry/index.mjs";
import { ajv } from "./ajv.mjs";

export { API_SCHEMAS };

// Schema validator cache
const compiledValidators = {};

export const getApiSchemaValidator = (apiAction) => {
  const schema = API_SCHEMAS[apiAction];

  if (!schema) return null;
  if (!compiledValidators[apiAction])
    compiledValidators[apiAction] = ajv.compile(schema);

  return compiledValidators[apiAction];
};
