import { sendAdminNotification, sendUserNotification } from "../send/index.mjs";
import {
  buildUserRecipientPlan,
  isCosmediateAdminActor,
  OVERSIGHT_SCOPE,
  resolveOversightRecipients,
  resolveOversightScope,
} from "./actor-routing.mjs";
import { dedupeEmails } from "./email-utils.mjs";

/**
 * Route and dispatch notification emails (oversight audit, target, actor, stakeholders).
 *
 * @param {{
 *   actor?: Record<string, unknown> | null,
 *   config: Record<string, unknown>,
 *   adminType?: string,
 *   adminData?: Record<string, unknown>,
 *   targetEmail?: string | null,
 *   targetType?: string,
 *   targetData?: Record<string, unknown>,
 *   selfEmail?: string | null,
 *   selfType?: string,
 *   selfData?: Record<string, unknown>,
 *   actorConfirmType?: string,
 *   actorConfirmData?: Record<string, unknown>,
 *   stakeholderEmails?: string[],
 *   stakeholderType?: string,
 *   stakeholderData?: Record<string, unknown>,
 *   includeOversight?: boolean,
 *   includeAdminAudit?: boolean,
 *   isSelfUpdate?: boolean,
 *   identityUpdates?: Record<string, unknown>,
 * }} params
 */
export const dispatchNotificationEmails = async ({
  actor,
  config,
  adminType = "",
  adminData = {},
  targetEmail,
  targetType = "",
  targetData = {},
  selfEmail,
  selfType = "",
  selfData = {},
  actorConfirmType = "",
  actorConfirmData = {},
  stakeholderEmails = [],
  stakeholderType = "",
  stakeholderData = {},
  includeOversight = true,
  includeAdminAudit = true,
  isSelfUpdate = false,
  identityUpdates = {},
}) => {
  const resolvedTargetEmail = targetEmail ?? selfEmail;
  const resolvedTargetType = targetType || selfType;
  const resolvedTargetData =
    Object.keys(targetData).length > 0 ? targetData : selfData;
  const shouldIncludeOversight = includeOversight && includeAdminAudit;

  if (shouldIncludeOversight && adminType) {
    await sendAdminNotification({
      type: adminType,
      data: adminData,
      config,
      auditScope: resolveOversightScope({
        actor,
        isSelfUpdate,
        identityUpdates,
      }),
    });
  }

  if (isCosmediateAdminActor(actor)) {
    return;
  }

  const plan = buildUserRecipientPlan({
    actor,
    targetEmail: resolvedTargetEmail,
    stakeholderEmails,
  });

  const sentTo = new Set();

  if (plan.targets.length && resolvedTargetType) {
    for (const to of plan.targets) {
      await sendUserNotification({
        to,
        type: resolvedTargetType,
        data: resolvedTargetData,
        config,
      });
      sentTo.add(to);
    }
  }

  if (plan.actor.length && actorConfirmType && !isSelfUpdate) {
    for (const to of plan.actor) {
      if (sentTo.has(to)) continue;
      await sendUserNotification({
        to,
        type: actorConfirmType,
        data: actorConfirmData,
        config,
      });
      sentTo.add(to);
    }
  }

  if (plan.stakeholders.length && stakeholderType) {
    for (const to of dedupeEmails(plan.stakeholders)) {
      if (sentTo.has(to)) continue;
      await sendUserNotification({
        to,
        type: stakeholderType,
        data: stakeholderData,
        config,
      });
      sentTo.add(to);
    }
  }
};

export { OVERSIGHT_SCOPE, resolveOversightRecipients };
