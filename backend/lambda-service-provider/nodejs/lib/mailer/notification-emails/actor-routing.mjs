import { USER_ROLES } from "../../../constants/auth/roles.constants.mjs";
import { resolveMailConfig } from "../resolve-mail-config.mjs";
import { dedupeEmails } from "./email-utils.mjs";

/** @readonly */
export const OVERSIGHT_SCOPE = Object.freeze({
  FULL: "full",
  MANDATORY_ONLY: "mandatory_only",
});

/**
 * True when the actor is a Cosmediate admin.
 *
 * @param {Record<string, unknown> | null | undefined} authContext
 * @returns {boolean}
 */
export const isCosmediateAdminActor = (authContext) =>
  authContext?.role === USER_ROLES.ADMIN;

/**
 * @param {Record<string, unknown> | null | undefined} authContext
 * @returns {string | null}
 */
export const resolveActorEmail = (authContext) => {
  const email = authContext?.email;
  if (!email || typeof email !== "string") return null;
  const normalized = email.trim().toLowerCase();
  return normalized || null;
};

/**
 * Load configured admin oversight emails (not every user with role ADMIN).
 *
 * @param {Record<string, unknown>} config
 * @returns {string[]}
 */
export const resolveAdminNotificationEmails = (config) => {
  const mailConfig = resolveMailConfig(config);
  return mailConfig.adminNotificationEmails ?? [];
};

/**
 * Load mandatory oversight emails for every domain audit event.
 *
 * @param {Record<string, unknown>} config
 * @returns {string[]}
 */
export const resolveMandatoryNotificationEmails = (config) => {
  const mailConfig = resolveMailConfig(config);
  return mailConfig.mandatoryNotificationEmails ?? [];
};

/**
 * Resolve oversight recipients for an admin-format audit email.
 *
 * @param {Record<string, unknown>} config
 * @param {typeof OVERSIGHT_SCOPE[keyof typeof OVERSIGHT_SCOPE]} [scope]
 * @returns {string[]}
 */
export const resolveOversightRecipients = (
  config,
  scope = OVERSIGHT_SCOPE.FULL,
) => {
  const adminEmails = resolveAdminNotificationEmails(config);
  const mandatoryEmails = resolveMandatoryNotificationEmails(config);

  if (scope === OVERSIGHT_SCOPE.MANDATORY_ONLY) {
    return dedupeEmails(mandatoryEmails);
  }

  return dedupeEmails([...adminEmails, ...mandatoryEmails]);
};

/**
 * Admin updating their own profile/identity without a permissions change.
 *
 * @param {{
 *   actor?: Record<string, unknown> | null,
 *   isSelfUpdate?: boolean,
 *   identityUpdates?: Record<string, unknown>,
 * }} params
 * @returns {boolean}
 */
export const isAdminSelfProfileUpdate = ({
  actor,
  isSelfUpdate = false,
  identityUpdates = {},
}) =>
  isCosmediateAdminActor(actor) &&
  isSelfUpdate &&
  identityUpdates.perms === undefined;

/**
 * Pick oversight scope for an admin audit send.
 *
 * @param {{
 *   actor?: Record<string, unknown> | null,
 *   isSelfUpdate?: boolean,
 *   identityUpdates?: Record<string, unknown>,
 * }} params
 * @returns {typeof OVERSIGHT_SCOPE[keyof typeof OVERSIGHT_SCOPE]}
 */
export const resolveOversightScope = ({
  actor,
  isSelfUpdate = false,
  identityUpdates = {},
}) =>
  isAdminSelfProfileUpdate({ actor, isSelfUpdate, identityUpdates })
    ? OVERSIGHT_SCOPE.MANDATORY_ONLY
    : OVERSIGHT_SCOPE.FULL;

/**
 * Build who receives user-facing notification emails based on actor role.
 * Admin actors acting on others get no self/stakeholder user emails.
 *
 * @param {{
 *   actor?: Record<string, unknown> | null,
 *   targetEmail?: string | null,
 *   stakeholderEmails?: string[],
 *   actorEmail?: string | null,
 * }} params
 * @returns {{ targets: string[], stakeholders: string[], actor: string[] }}
 */
export const buildUserRecipientPlan = ({
  actor,
  targetEmail,
  stakeholderEmails = [],
  actorEmail,
}) => {
  if (isCosmediateAdminActor(actor)) {
    return { targets: [], stakeholders: [], actor: [] };
  }

  const normalizedActor =
    actorEmail?.trim().toLowerCase() ??
    resolveActorEmail(actor) ??
    null;

  return {
    targets: targetEmail ? [targetEmail.trim().toLowerCase()] : [],
    stakeholders: dedupeEmails(stakeholderEmails),
    actor: normalizedActor ? [normalizedActor] : [],
  };
};

/**
 * @deprecated Use buildUserRecipientPlan + resolveOversightRecipients in dispatch.
 * @param {{
 *   actor?: Record<string, unknown> | null,
 *   selfEmail?: string | null,
 *   stakeholderEmails?: string[],
 *   includeAdminAudit?: boolean,
 *   config: Record<string, unknown>,
 * }} params
 * @returns {{ adminAudit: string[], self: string[], stakeholders: string[] }}
 */
export const buildRecipientPlan = ({
  actor,
  selfEmail,
  stakeholderEmails = [],
  includeAdminAudit = true,
  config,
}) => {
  const adminAudit = includeAdminAudit
    ? resolveOversightRecipients(config, OVERSIGHT_SCOPE.FULL)
    : [];

  if (isCosmediateAdminActor(actor)) {
    return {
      adminAudit,
      self: [],
      stakeholders: [],
    };
  }

  return {
    adminAudit,
    self: selfEmail ? [selfEmail.trim().toLowerCase()] : [],
    stakeholders: dedupeEmails(stakeholderEmails),
  };
};
