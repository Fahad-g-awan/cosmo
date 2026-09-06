/** @type {Map<string, number>} */
const lastSentAtByKey = new Map();

const DEFAULT_MIN_INTERVAL_MS = 15 * 60 * 1000;

/**
 * In-memory dedupe for dev alerts on warm Lambda instances.
 *
 * @param {string | undefined} rateLimitKey
 * @param {number} minIntervalMs
 */
export const shouldSendDevAlert = (
  rateLimitKey,
  minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
) => {
  if (!rateLimitKey) return true;

  const now = Date.now();
  const lastSent = lastSentAtByKey.get(rateLimitKey) ?? 0;

  if (now - lastSent < minIntervalMs) {
    return false;
  }

  lastSentAtByKey.set(rateLimitKey, now);
  return true;
};
