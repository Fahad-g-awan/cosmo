import { deny } from "./utils.mjs";

/**
 * Maps JWT verification errors to authorizer deny responses.
 * @returns {ReturnType<deny> | null}
 */
export function denyFromAuthError(err) {
  if (err.name === "TokenExpiredError" || err.name === "JwtExpiredError") {
    return deny({
      context: { reason: "Unauthorized Access: Token expired" },
      headers: {},
      message: "Unauthorized Access: Token expired",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return deny({
      context: { reason: "Unauthorized Access: Invalid token" },
      headers: {},
      message: "Unauthorized Access: Invalid token",
    });
  }

  return null;
}

export function denyAuthorizationFailed() {
  return deny({
    context: { reason: "Unauthorized Access: Authorization failed" },
    headers: {},
    message: "Unauthorized Access: Authorization failed",
  });
}
