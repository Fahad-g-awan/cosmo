import { dispatchNotificationEmails } from "../dispatch-notification-emails.mjs";
import { emitEntityUpdateNotificationEmails } from "../../notify.mjs";
import { adminAuditPayload } from "../actor-context.mjs";
import { NOTIFICATION_EMAIL_ACTION } from "../notification-email-actions.mjs";
import { buildMailUrls } from "../../mail-urls.mjs";
import { dispatchEmail } from "../../dispatch-email.mjs";
import { EMAIL_TYPE } from "../../mailer.config.mjs";

/**
 * Send admin create/update/delete notification emails.
 *
 * @param {{
 *   action: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   ctx: { authContext?: object, config: object },
 *   admin: {
 *     id: string,
 *     email?: string,
 *     fullName?: string,
 *     firstName?: string,
 *   },
 *   isSelfUpdate?: boolean,
 *   identityUpdates?: Record<string, unknown>,
 *   profileUpdated?: boolean,
 * }} params
 */
export const emitAdminNotificationEmails = async ({
  action,
  ctx,
  admin,
  isSelfUpdate = false,
  identityUpdates = {},
  profileUpdated = false,
}) => {
  const { authContext, config } = ctx;
  const adminLabel = admin.fullName || admin.firstName || admin.email;
  const auditData = adminAuditPayload({
    authContext,
    entityType: "admin",
    entityLabel: adminLabel ?? admin.id,
    entityId: admin.id,
  });

  if (action === NOTIFICATION_EMAIL_ACTION.CREATED) {
    const { signInUrl, dashboardUrl } = buildMailUrls(config);

    if (admin.email) {
      await dispatchEmail({
        to: admin.email,
        type: EMAIL_TYPE.WELCOME_ADMIN,
        data: {
          firstName: admin.firstName,
          fullName: admin.fullName,
          email: admin.email,
          signInUrl,
          dashboardUrl,
        },
        config,
      });
    }

    const createdByAnotherAdmin =
      authContext?.entityId && authContext.entityId !== admin.id;

    if (createdByAnotherAdmin) {
      await dispatchNotificationEmails({
        actor: authContext,
        config,
        adminType: EMAIL_TYPE.ADMIN_USER_PROVISIONED,
        adminData: auditData,
      });
    }

    return;
  }

  if (action === NOTIFICATION_EMAIL_ACTION.UPDATED) {
    await emitEntityUpdateNotificationEmails({
      isSelfUpdate,
      authContext,
      config,
      targetEmail: admin.email,
      targetName: adminLabel,
      targetId: admin.id,
      entityType: "admin",
      identityUpdates,
      profileUpdated,
    });

    return;
  }

  if (action === NOTIFICATION_EMAIL_ACTION.DELETED) {
    await dispatchNotificationEmails({
      actor: authContext,
      config,
      adminType: EMAIL_TYPE.ADMIN_ENTITY_DELETED,
      adminData: auditData,
    });
  }
};
