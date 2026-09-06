const DEFAULT_MAX = 4000;

/**
 * @param {unknown} value
 * @param {number} [max]
 */
export const truncatePayload = (value, max = DEFAULT_MAX) => {
  const text =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
};
