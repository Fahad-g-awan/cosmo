import { EMAIL_TYPE } from "../../mailer.config.mjs";
import { adminEmail } from "./_admin-utils.mjs";

/** @type {Record<string, { subject: string, title: string, buildSummary: (data: Record<string, unknown>) => string }>} */
const ADMIN_COPY = {
  [EMAIL_TYPE.ADMIN_USER_PROVISIONED]: {
    subject: "User provisioned on Cosmediate",
    title: "User provisioned",
    buildSummary: (data) =>
      `${data.actorName ?? "Someone"} provisioned a new ${data.entityType ?? "user"}${data.entityLabel ? `: ${data.entityLabel}` : ""}.`,
  },
  [EMAIL_TYPE.ADMIN_PERMISSIONS_CHANGED]: {
    subject: "Permissions changed on Cosmediate",
    title: "Permissions changed",
    buildSummary: (data) =>
      `${data.actorName ?? "Someone"} updated permissions${data.entityLabel ? ` for ${data.entityLabel}` : ""}.`,
  },
  [EMAIL_TYPE.ADMIN_ENTITY_CREATED]: {
    subject: "New entity created on Cosmediate",
    title: "Entity created",
    buildSummary: (data) =>
      `${data.actorName ?? "Someone"} created a new ${data.entityType ?? "entity"}${data.entityLabel ? `: ${data.entityLabel}` : ""}.`,
  },
  [EMAIL_TYPE.ADMIN_ENTITY_UPDATED]: {
    subject: "Entity updated on Cosmediate",
    title: "Entity updated",
    buildSummary: (data) =>
      `${data.actorName ?? "Someone"} updated ${data.entityType ?? "an entity"}${data.entityLabel ? `: ${data.entityLabel}` : ""}.`,
  },
  [EMAIL_TYPE.ADMIN_ENTITY_DELETED]: {
    subject: "Entity deleted on Cosmediate",
    title: "Entity deleted",
    buildSummary: (data) =>
      `${data.actorName ?? "Someone"} deleted ${data.entityType ?? "an entity"}${data.entityLabel ? `: ${data.entityLabel}` : ""}.`,
  },
  [EMAIL_TYPE.ADMIN_SENSITIVE_ACTION]: {
    subject: "Sensitive platform action",
    title: "Sensitive action",
    buildSummary: (data) =>
      `${data.actorName ?? "Someone"} performed a sensitive action: ${data.action ?? "unspecified"}.`,
  },
};

/**
 * @param {string} type
 * @param {Record<string, unknown>} data
 */
const adminEmailFromType = (type, data) => {
  const copy = ADMIN_COPY[type];
  if (!copy) {
    throw new Error(`[mailer] Unknown admin email type: ${type}`);
  }

  const when = data.occurredAt
    ? new Date(String(data.occurredAt)).toUTCString()
    : undefined;

  return adminEmail({
    subject: copy.subject,
    title: copy.title,
    previewText: copy.buildSummary(data),
    summary: copy.buildSummary(data),
    fields: {
      Actor: data.actorName,
      "Actor email": data.actorEmail,
      Action: data.action,
      "Entity type": data.entityType,
      Entity: data.entityLabel,
      "Entity ID": data.entityId,
      When: when,
    },
  });
};

/** @param {Record<string, unknown>} data */
export const userProvisionedEmail = (data) =>
  adminEmailFromType(EMAIL_TYPE.ADMIN_USER_PROVISIONED, data);

/** @param {Record<string, unknown>} data */
export const permissionsChangedEmail = (data) =>
  adminEmailFromType(EMAIL_TYPE.ADMIN_PERMISSIONS_CHANGED, data);

/** @param {Record<string, unknown>} data */
export const entityCreatedEmail = (data) =>
  adminEmailFromType(EMAIL_TYPE.ADMIN_ENTITY_CREATED, data);

/** @param {Record<string, unknown>} data */
export const entityUpdatedEmail = (data) =>
  adminEmailFromType(EMAIL_TYPE.ADMIN_ENTITY_UPDATED, data);

/** @param {Record<string, unknown>} data */
export const entityDeletedEmail = (data) =>
  adminEmailFromType(EMAIL_TYPE.ADMIN_ENTITY_DELETED, data);

/** @param {Record<string, unknown>} data */
export const sensitiveActionEmail = (data) =>
  adminEmailFromType(EMAIL_TYPE.ADMIN_SENSITIVE_ACTION, data);
