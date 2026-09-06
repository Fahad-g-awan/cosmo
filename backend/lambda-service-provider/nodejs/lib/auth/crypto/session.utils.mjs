import crypto from "crypto";

/**
 * Generates a session ID using a random byte array.
 * @returns {string} The session ID.
 */
export const generateSessionId = () =>
  crypto.randomBytes(32).toString("base64url");
