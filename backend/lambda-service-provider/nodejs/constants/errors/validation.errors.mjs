/** Request / schema validation errors. */
export const VALIDATION_ERRORS = {
  VALIDATION_ERROR: {
    code: "validation_error",
    status: 422,
    message: "Validation failed",
  },
  SCHEMA_ERROR: {
    code: "schema_error",
    status: 400,
    message: "Schema error",
  },
  UNKNOWN_API_ACTION: {
    code: "unknown_api_action",
    status: 400,
    message: "Unknown api action",
  },
  INVALID_JSON_BODY: {
    code: "invalid_json_body",
    status: 400,
    message: "Invalid JSON body",
  },
  INVALID_REQUEST_DATA: {
    code: "invalid_request_data",
    status: 400,
    message: "Invalid request data",
  },
};
