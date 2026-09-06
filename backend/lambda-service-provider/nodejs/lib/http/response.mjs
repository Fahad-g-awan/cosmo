import { isHttpError, toErrorPayload } from "../errors/http-error.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";

/**
 * This function is used to return successful response to a API request.
 *
 * @param {object} input
 * @param {number} input.statusCode
 * @param {object} input.payload
 * @param {object} input.headers
 * @param {object} input.cookies
 */
export const respond = ({
  statusCode,
  payload = {},
  headers = {},
  cookies = [],
  isAuthorized = null,
  context = {},
}) => {
  const response = {
    statusCode,
    isAuthorized,
    context,
    headers: Object.fromEntries(
      Object.entries(headers || {}).map(([k, v]) => [k, String(v)]),
    ),
    cookies,
    body: statusCode === 204 ? "" : JSON.stringify(payload ?? {}),
    isBase64Encoded: false,
  };

  console.log("Response from handler", response);

  return response;
};

/**
 * This function is used to return error response to a API request.
 *
 * @param {Error} err
 * @param {object} [input.headers]
 * @param {object} [input.cookies]
 */
export const respondError = (err, { headers = {}, cookies = [] } = {}) => {
  const statusCode = isHttpError(err)
    ? err.statusCode
    : typeof err?.statusCode === "number"
      ? err.statusCode
      : API_ERRORS.INTERNAL_ERROR.status;

  return respond({
    statusCode,
    payload: toErrorPayload(err),
    headers,
    cookies,
  });
};
