/**
 * Path utilities - wraps lodash for future escape hatch
 */
import lodashGet from "lodash.get";
import lodashSet from "lodash.set";

/**
 * Get a value from an object by path
 * @example get({ a: { b: 1 } }, "a.b") → 1
 */
export function get<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T {
  return lodashGet(obj, path, defaultValue) as T;
}

/**
 * Set a value in an object by path (mutates object)
 * @example set({ a: {} }, "a.b", 1) → { a: { b: 1 } }
 */
export function set<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown
): T {
  return lodashSet(obj, path, value) as T;
}

/**
 * Immutable set - returns a new object with the value set
 * Uses shallow clone for performance (no deep structuredClone)
 */
export function setImmutable<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown
): T {
  // Shallow clone - much faster than structuredClone for large forms
  const clone = { ...obj } as T;
  return lodashSet(clone, path, value) as T;
}
