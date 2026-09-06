import { dispatchNotificationEmails } from "../dispatch-notification-emails.mjs";
import { NOTIFICATION_EMAIL_ACTION } from "../notification-email-actions.mjs";
import { adminAuditPayload } from "../actor-context.mjs";
import { EMAIL_TYPE } from "../../mailer.config.mjs";

/**
 * Send treatment catalog CRUD oversight emails (admin + mandatory only).
 *
 * @param {{
 *   action: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   ctx: { authContext?: object, config: object },
 *   entityType: string,
 *   entity: { id: string, name?: string | null, title?: string | null },
 * }} params
 */
export const emitTreatmentNotificationEmails = async ({
  action,
  ctx,
  entityType,
  entity,
}) => {
  const { authContext, config } = ctx;
  const label = entity.name ?? entity.title ?? entity.id;

  const auditData = adminAuditPayload({
    authContext,
    entityType,
    entityLabel: label,
    entityId: entity.id,
  });

  const adminTypeByAction = {
    [NOTIFICATION_EMAIL_ACTION.CREATED]: EMAIL_TYPE.ADMIN_ENTITY_CREATED,
    [NOTIFICATION_EMAIL_ACTION.UPDATED]: EMAIL_TYPE.ADMIN_ENTITY_UPDATED,
    [NOTIFICATION_EMAIL_ACTION.DELETED]: EMAIL_TYPE.ADMIN_ENTITY_DELETED,
  };

  await dispatchNotificationEmails({
    actor: authContext,
    config,
    adminType: adminTypeByAction[action],
    adminData: auditData,
  });
};
