import { sendDevAlertEmail } from "./send-dev-alert-email.mjs";

/**
 * @param {unknown} error
 */
const isMaintenanceModeError = (error) => {
  if (!error || typeof error !== "object") return false;
  if (error.name !== "HttpError" || Number(error.statusCode) !== 503) {
    return false;
  }

  const details = Array.isArray(error.details) ? error.details : [];
  return details.includes("maintenance_mode");
};

/**
 * @param {unknown} error
 */
const isExpectedClientError = (error) => {
  if (!error || typeof error !== "object") return false;
  if (isMaintenanceModeError(error)) return true;
  if (error.name === "HttpError" && Number(error.statusCode) < 500) {
    return true;
  }
  return false;
};

/**
 * @param {unknown} error
 */
const truncateStack = (error) => {
  const stack = error instanceof Error ? error.stack : undefined;
  if (!stack) return undefined;
  return stack.length > 4000 ? `${stack.slice(0, 4000)}…` : stack;
};

/**
 * Safe wrapper for dev alerts — never throws, does not alter error handling.
 *
 * @param {{
 *   module: string,
 *   error: unknown,
 *   config?: Record<string, unknown>,
 *   correlationId?: string,
 *   event?: Record<string, unknown>,
 * }} params
 */
export const reportDevAlert = async ({
  module,
  error,
  config = {},
  correlationId,
  event,
}) => {
  try {
    if (isExpectedClientError(error)) {
      return null;
    }

    const err = error instanceof Error ? error : new Error(String(error));

    return await sendDevAlertEmail({
      config,
      data: {
        module,
        errorName: err.name,
        errorMessage: err.message,
        stackTrace: truncateStack(err),
        correlationId:
          correlationId ??
          (typeof event?.requestContext?.requestId === "string"
            ? event.requestContext.requestId
            : undefined),
        requestId:
          typeof event?.requestContext?.requestId === "string"
            ? event.requestContext.requestId
            : undefined,
        routeKey:
          typeof event?.requestContext?.routeKey === "string"
            ? event.requestContext.routeKey
            : undefined,
      },
    });
  } catch (alertErr) {
    console.error("[mailer] reportDevAlert failed", {
      module,
      error: alertErr?.message ?? String(alertErr),
    });
    return null;
  }
};
