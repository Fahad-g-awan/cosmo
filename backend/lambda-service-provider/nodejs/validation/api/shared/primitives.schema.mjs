export const uuid = { type: "string", format: "uuid" };

export const String = {
  type: "string",
  minLength: 1,
  maxLength: 500,
  pattern: "\\S",
};

export const Integer = {
  type: "number",
  minimum: 0,
  maximum: 120,
};

export const BigInteger = {
  type: "number",
  minimum: 0,
  maximum: 9999999,
};

export const Float = {
  type: "number",
  minimum: 1,
  maximum: 100,
  multipleOf: 0.5, // or 0.1 if you want finer granularity
};

export const BigFloat = {
  type: "number",
  minimum: 1,
  maximum: 9999999,
  multipleOf: 0.5, // or 0.1 if you want finer granularity
};

export const Boolean = { type: "boolean" };

export const URI = { type: "string", format: "uri" };

/**
 * Optional string that may be cleared on update (empty string or null → DB null).
 * Non-empty values still require a real non-whitespace string.
 */
export const ClearableString = {
  anyOf: [
    { type: "null" },
    { type: "string", maxLength: 0 },
    String,
  ],
};

/** Optional image URI that may be cleared (empty / null). */
export const ClearableURI = {
  anyOf: [
    { type: "null" },
    { type: "string", maxLength: 0 },
    URI,
  ],
};

/** Optional age that may be cleared. */
export const ClearableInteger = {
  anyOf: [{ type: "null" }, { type: "string", maxLength: 0 }, Integer],
};
