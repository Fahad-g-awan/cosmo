import { dispatchNotificationEmails } from "../dispatch-notification-emails.mjs";
import { NOTIFICATION_EMAIL_ACTION } from "../notification-email-actions.mjs";
import { adminAuditPayload } from "../actor-context.mjs";
import { EMAIL_TYPE } from "../../mailer.config.mjs";

/**
 * Send clinic category CRUD admin audit emails (admin + mandatory only).
 *
 * @param {{
 *   action: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   ctx: { authContext?: object, config: object },
 *   category: { id: string, name?: string | null },
 * }} params
 */
export const emitClinicCategoryNotificationEmails = async ({
  action,
  ctx,
  category,
}) => {
  const { authContext, config } = ctx;
  const label = category.name ?? category.id;

  const auditData = adminAuditPayload({
    authContext,
    entityType: "clinic category",
    entityLabel: label,
    entityId: category.id,
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
