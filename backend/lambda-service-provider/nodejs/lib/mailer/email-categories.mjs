import { EMAIL_TYPE_META } from "./mailer.config.mjs";

/**
 * @param {string} type — EMAIL_TYPE value
 * @returns {string | undefined}
 */
export const getEmailCategory = (type) => EMAIL_TYPE_META[type]?.category;

/**
 * @param {string} type
 * @returns {{ category?: string, priority?: string, rateLimitKey?: string } | undefined}
 */
export const getEmailTypeMeta = (type) => EMAIL_TYPE_META[type];
