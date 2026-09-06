/** Cross-cutting HTTP-level errors (fallbacks + common transport errors). */

export const SHARED_ERRORS = {
  BAD_REQUEST: {
    code: "bad_request",
    status: 400,
    message: "Bad request",
  },
  VALIDATION_ERROR: {
    code: "validation_error",
    status: 422,
    message: "Validation failed",
  },
  UNAUTHORIZED: {
    code: "unauthorized",
    status: 401,
    message: "Unauthorized",
  },
  FORBIDDEN: {
    code: "forbidden",
    status: 403,
    message: "Forbidden",
  },
  NOT_FOUND: {
    code: "not_found",
    status: 404,
    message: "Not found",
  },
  CONFLICT: {
    code: "conflict",
    status: 409,
    message: "Conflict",
  },
  CLINIC_TREATMENT_HAS_ASSIGNMENTS: {
    code: "clinic_treatment_has_assignments",
    status: 409,
    message:
      "Cannot remove clinic treatment while active specialist assignments exist",
  },
  TOO_MANY_REQUESTS: {
    code: "too_many_requests",
    status: 429,
    message: "Too many requests",
  },
  INTERNAL_ERROR: {
    code: "internal_error",
    status: 500,
    message: "Internal server error",
  },
  SERVICE_UNAVAILABLE: {
    code: "service_unavailable",
    status: 503,
    message: "Service unavailable",
  },
};

export const STATUS_FALLBACK_ERROR = {
  400: SHARED_ERRORS.BAD_REQUEST,
  401: SHARED_ERRORS.UNAUTHORIZED,
  403: SHARED_ERRORS.FORBIDDEN,
  404: SHARED_ERRORS.NOT_FOUND,
  409: SHARED_ERRORS.CONFLICT,
  422: SHARED_ERRORS.VALIDATION_ERROR,
  429: SHARED_ERRORS.TOO_MANY_REQUESTS,
  500: SHARED_ERRORS.INTERNAL_ERROR,
  503: SHARED_ERRORS.SERVICE_UNAVAILABLE,
};
