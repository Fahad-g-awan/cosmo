import crypto from "crypto";

import { API_ERRORS } from "../../../constants/errors/index.mjs";
import { httpError } from "../../errors/http-error.mjs";

/**
 * Calculates the secret hash for the given username, client ID, and client secret.
 *
 * @param {string} username - The username.
 * @param {string} clientId - The client ID.
 * @param {string} clientSecret - The client secret.
 * @returns {string} The secret hash.
 */
export const calculateSecretHash = (username, clientId, clientSecret) => {
  if (!username || !clientId || !clientSecret) {
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Error while calculating secret hash",
      details: [
        "calculateSecretHash requires username, clientId, and clientSecret",
      ],
    });
  }

  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
};
