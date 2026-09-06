import { AsyncLocalStorage } from "node:async_hooks";

const requestContext = new AsyncLocalStorage();

/**
 * Run `fn` with the given per-request context available via `getRequestContext`.
 *
 * @template T
 * @param {object} ctx
 * @param {() => T | Promise<T>} fn
 * @returns {Promise<T>}
 */
export const useRequestContext = (ctx, fn) =>
  requestContext.run(ctx, () => Promise.resolve().then(fn));

/**
 * @returns {object | undefined}
 */
export const getRequestContext = () => requestContext.getStore();
