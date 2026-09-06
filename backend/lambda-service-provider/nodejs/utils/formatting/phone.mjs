/**
 * Phone helpers — normalize loose user input to E.164-ish `+digits`,
 * then validate. Empty → undefined (optional fields omit; saves use phoneOrNA).
 */

export const PHONE_PLACEHOLDER = "N/A";

/** E.164: + then 1–15 digits, first digit 1–9. */
export const PHONE_E164_PATTERN = /^\+[1-9]\d{1,14}$/;

const PHONE_KEY_RE = /(^|.*)phone$/i;

/**
 * @param {string} key
 * @returns {boolean}
 */
export const isPhoneFieldKey = (key) =>
  typeof key === "string" && PHONE_KEY_RE.test(key);

/**
 * Strip formatting and coerce toward E.164.
 * @param {unknown} raw
 * @returns {string | undefined} Normalized phone, or undefined if empty
 */
export const normalizePhone = (raw) => {
  if (raw == null) return undefined;

  let value = String(raw).trim();
  if (!value) return undefined;

  // Never treat the DB sentinel as user input worth keeping in the request body.
  if (value.toUpperCase() === PHONE_PLACEHOLDER) return undefined;

  value = value.replace(/[\s\-().]/g, "");

  if (value.startsWith("00")) {
    value = `+${value.slice(2)}`;
  }

  if (!value.startsWith("+") && /^\d+$/.test(value)) {
    value = `+${value}`;
  }

  if (value.startsWith("+")) {
    value = `+${value.slice(1).replace(/\D/g, "")}`;
  } else {
    value = value.replace(/\D/g, "");
  }

  if (!value || value === "+") return undefined;
  return value;
};

/**
 * @param {unknown} raw
 * @returns {boolean}
 */
export const isValidE164Phone = (raw) => {
  const normalized = normalizePhone(raw);
  return Boolean(normalized && PHONE_E164_PATTERN.test(normalized));
};

/**
 * Persist helper: real E.164 or temporary "N/A" when missing.
 * @param {unknown} raw
 * @returns {string}
 */
export const phoneOrNA = (raw) => {
  const normalized = normalizePhone(raw);
  if (normalized && PHONE_E164_PATTERN.test(normalized)) return normalized;
  return PHONE_PLACEHOLDER;
};
