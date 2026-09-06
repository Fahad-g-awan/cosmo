/**
 * Decode the body buffer if it is base64 encoded
 * otherwise return the original body buffer.
 *
 * @param {string} body - The body to decode.
 * @param {boolean} isBase64Encoded - Whether the body is base64 encoded.
 * @returns {Buffer} The decoded body buffer.
 */
export const decodeBodyBuffer = (body, isBase64Encoded) => {
  if (isBase64Encoded) {
    return Buffer.from(body, "base64");
  }

  let bodyBuffer = Buffer.from(body, "binary");

  // Some API Gateway / integration setups deliver multipart bodies base64-encoded
  // but do not set event.isBase64Encoded=true. Try to detect and decode.
  try {
    const maybeBase64 = Buffer.from(body, "base64");
    const maybeText = maybeBase64.toString("utf8");
    if (
      maybeText.includes("Content-Disposition") ||
      maybeText.includes("multipart/form-data")
    ) {
      bodyBuffer = maybeBase64;
    }
  } catch {
    // ignore, keep binary buffer
  }

  return bodyBuffer;
};

/**
 * Parse the JSON body.
 *
 * @param {string} body - The body to parse.
 * @param {boolean} isBase64Encoded - Whether the body is base64 encoded.
 * @returns {object} The parsed body.
 */
export const parseJsonBody = (body, isBase64Encoded) => {
  const text = isBase64Encoded
    ? Buffer.from(body, "base64").toString("utf8")
    : body;

  return JSON.parse(text);
};
