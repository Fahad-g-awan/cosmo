import { ORIGIN_WHITELIST } from "../../config/cors.mjs";
import { respond } from "../http/response.mjs";

/**
 * Get the origin from the event.
 *
 * @param {object} event - The event object.
 * @returns {string|null} The origin.
 */
export const getOrigin = (event) => {
  const o = event?.headers?.origin || event?.headers?.Origin || "";
  return ORIGIN_WHITELIST.includes(o) ? o : null;
};

/**
 * Set the CORS headers.
 *
 * @param {string} origin - The origin.
 * @returns {object} The CORS headers.
 */
export const cors = (origin) => {
  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,Accept",
        Vary: "Origin",
      }
    : {};
};

/**
 * Handle the OPTIONS (preflight) request.
 *
 * @param {object} event - The event object.
 * @returns {object} The response object.
 */
export const options = async (event) => {
  const origin = getOrigin(event);

  if (!origin)
    return respond({
      statusCode: 403,
      payload: { error: "Origin not allowed" },
      headers: { Vary: "Origin" },
    });

  const reqHdrs =
    event.headers?.["access-control-request-headers"] ||
    event.headers?.["Access-Control-Request-Headers"] ||
    "";

  return respond({
    statusCode: 204,
    payload: {},
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
      "Access-Control-Max-Age": "600",
      "Access-Control-Allow-Headers":
        reqHdrs || "Content-Type,Authorization,Accept",
      Vary: "Origin",
    },
  });
};
