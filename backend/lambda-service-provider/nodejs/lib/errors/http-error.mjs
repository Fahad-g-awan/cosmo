import {
  API_ERRORS,
  resolveApiError,
  STATUS_FALLBACK_ERROR,
} from "../../constants/errors/index.mjs";

export class HttpError extends Error {
  constructor({ status, code, message, details = [] }) {
    super(message);
    this.name = "HttpError";
    this.statusCode = status;
    this.code = code;
    this.details = details.filter(Boolean);
  }
}

/**
 * This function is used to create a new HttpError instance.
 * It returns a new HttpError instance.
 *
 * @param {object} input
 * @param {object} [input.error] - API_ERRORS.* definition
 * @param {number} [input.status]
 * @param {string} [input.code]
 * @param {string} [input.message]
 * @param {string[]} [input.details]
 */
export const httpError = (input) => {
  const def = resolveApiError(input?.error ?? input?.code);

  const status =
    input.status ?? def?.status ?? API_ERRORS.INTERNAL_ERROR.status;
  const code =
    input.code ??
    def?.code ??
    STATUS_FALLBACK_ERROR[status]?.code ??
    API_ERRORS.INTERNAL_ERROR.code;
  const message =
    input.message ?? def?.message ?? API_ERRORS.INTERNAL_ERROR.message;
  const details = input.details ?? [];

  return new HttpError({ status, code, message, details });
};

/**
 * This function is used to check if a given error is a HttpError instance.
 * It returns true if the error is a HttpError instance, false otherwise.
 *
 * @param {Error} err
 * @returns {boolean}
 */
export const isHttpError = (err) =>
  err instanceof HttpError ||
  (Boolean(err) &&
    typeof err.statusCode === "number" &&
    typeof err.code === "string" &&
    typeof err.message === "string");

/**
 * This function is used to convert a HttpError instance to a payload object.
 *
 * @param {HttpError} err
 * @returns {object} The payload object.
 */
export const toErrorPayload = (err) => {
  const code =
    err?.code ??
    STATUS_FALLBACK_ERROR[err?.statusCode]?.code ??
    API_ERRORS.INTERNAL_ERROR.code;

  return {
    success: false,
    error: code,
    message: err?.message ?? API_ERRORS.INTERNAL_ERROR.message,
    details: err?.details?.length ? err.details : null,
  };
};

/**
 * This function is used to rethrow an error or throw an internal error.
 * It takes an error and a message and throws a new HttpError instance.
 *
 * @param {Error} err
 * @param {string} message
 * @throws {HttpError}
 */
export const rethrowOrInternal = (
  err,
  message = API_ERRORS.INTERNAL_ERROR.message,
) => {
  if (isHttpError(err)) throw err;

  const details = [err?.message ?? "Something went wrong"];

  if (err?.details?.length) {
    details.push(...err.details);
  }

  throw httpError({
    error: API_ERRORS.INTERNAL_ERROR,
    message,
    details,
  });
};
