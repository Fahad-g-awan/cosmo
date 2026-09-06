/**
 * In-memory TTL cache with in-flight request deduplication (warm Lambda reuse).
 *
 * @param {number} ttlMs - The time to live in milliseconds.
 * @returns {object} - An object with a `getOrFetch` method.
 */
export const createTtlCache = (ttlMs) => {
  const cache = new Map();
  const inFlight = new Map();

  const getOrFetch = async (key, fetchFn) => {
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && now - cached.fetchedAt < ttlMs) {
      return cached.value;
    }

    const pending = inFlight.get(key);
    if (pending) return pending;

    const promise = (async () => {
      try {
        const value = await fetchFn();
        cache.set(key, { value, fetchedAt: now });
        return value;
      } finally {
        inFlight.delete(key);
      }
    })();

    inFlight.set(key, promise);
    return promise;
  };

  return { getOrFetch };
};
