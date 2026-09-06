import { isPhoneFieldKey, normalizePhone } from "../../utils/formatting/phone.mjs";

/**
 * Normalize API JSON data.
 *
 * @param {string|object|array|number|boolean|null} data - The data to normalize.
 * @returns {object|array|string|number|boolean|null} The normalized data.
 *
 * @example
 * normalizeRequest("{"a":1}") // { a: 1 }
 * normalizeRequest("["x","y"]") // [ 'x', 'y' ]
 * normalizeRequest("null") // null
 * normalizeRequest("true") // true
 * normalizeRequest("false") // false
 * normalizeRequest("1") // 1
 * normalizeRequest("x") // "x"
 */
export const normalizeRequest = (data) => {
  if (data === null || data === undefined) return data;

  // Try to parse JSON strings like '{"a":1}' or '["x","y"]'
  if (typeof data === "string") {
    const str = data.trim();

    // Try JSON parse
    if (
      (str.startsWith("{") && str.endsWith("}")) ||
      (str.startsWith("[") && str.endsWith("]"))
    ) {
      try {
        return JSON.parse(str);
      } catch {
        return str; // just return original if invalid JSON
      }
    }

    // Convert other primitives
    if (str === "true") return true;
    if (str === "false") return false;
    if (str === "null") return null;
    // if (!isNaN(str) && str !== "") return Number(str);

    return str; // leave plain strings untouched
  }

  // Recursively handle arrays and objects
  if (Array.isArray(data)) {
    return data.map(normalizeRequest);
  }

  if (typeof data === "object") {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      const normalizedValue = normalizeRequest(value);

      if (isPhoneFieldKey(key) && typeof normalizedValue === "string") {
        const phone = normalizePhone(normalizedValue);
        // Empty phone → null so updates can clear; omit is reserved for "not sent".
        result[key] = phone === undefined ? null : phone;
        continue;
      }

      result[key] = normalizedValue;
    }
    return result;
  }

  return data;
};
