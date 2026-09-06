import { EMAIL_TYPE } from "../../mailer.config.mjs";
import { adminAuditPayload } from "../actor-context.mjs";
import { dispatchNotificationEmails } from "../dispatch-notification-emails.mjs";
import { NOTIFICATION_EMAIL_ACTION } from "../notification-email-actions.mjs";
import { diffIdSets } from "../email-utils.mjs";
import {
  resolveClinicStakeholderEmails,
  resolveManagerEmailsByIds,
} from "../recipient-resolvers.mjs";

/**
 * Send clinic create/update/delete notification emails.
 *
 * @param {{
 *   action: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   ctx: { authContext?: object, config: object, prisma: import("@prisma/client").PrismaClient },
 *   clinic: { id: string, name?: string | null, email?: string | null },
 *   previousManagerIds?: string[],
 *   managerIds?: string[],
 * }} params
 */
export const emitClinicNotificationEmails = async ({
  action,
  ctx,
  clinic,
  previousManagerIds = [],
  managerIds,
}) => {
  const { authContext, config, prisma } = ctx;
  const clinicLabel = clinic.name ?? clinic.email ?? clinic.id;
  const auditData = adminAuditPayload({
    authContext,
    entityType: "clinic",
    entityLabel: clinicLabel,
    entityId: clinic.id,
  });
  const stakeholderData = {
    clinicName: clinicLabel,
    ...auditData,
  };

  if (action === NOTIFICATION_EMAIL_ACTION.CREATED) {
    const attachedManagerEmails = await resolveManagerEmailsByIds(
      prisma,
      managerIds ?? [],
    );

    await dispatchNotificationEmails({
      actor: authContext,
      config,
      adminType: EMAIL_TYPE.ADMIN_ENTITY_CREATED,
      adminData: auditData,
      stakeholderEmails: attachedManagerEmails,
      stakeholderType: EMAIL_TYPE.USER_MANAGER_CLINIC_ASSIGNED,
      stakeholderData: {
        ...stakeholderData,
        managerName: null,
      },
    });

    return;
  }

  if (action === NOTIFICATION_EMAIL_ACTION.UPDATED) {
    const stakeholderEmails = await resolveClinicStakeholderEmails(
      prisma,
      clinic.id,
    );

    await dispatchNotificationEmails({
      actor: authContext,
      config,
      adminType: EMAIL_TYPE.ADMIN_ENTITY_UPDATED,
      adminData: auditData,
      stakeholderEmails,
      stakeholderType: EMAIL_TYPE.USER_CLINIC_UPDATED,
      stakeholderData,
    });

    if (managerIds !== undefined) {
      const { added, removed } = diffIdSets(previousManagerIds, managerIds);

      if (added.length) {
        const addedManagerEmails = await resolveManagerEmailsByIds(
          prisma,
          added,
        );
        await dispatchNotificationEmails({
          actor: authContext,
          config,
          includeOversight: false,
          stakeholderEmails: addedManagerEmails,
          stakeholderType: EMAIL_TYPE.USER_MANAGER_CLINIC_ASSIGNED,
          stakeholderData,
        });
      }

      if (removed.length) {
        const removedManagerEmails = await resolveManagerEmailsByIds(
          prisma,
          removed,
        );
        await dispatchNotificationEmails({
          actor: authContext,
          config,
          includeOversight: false,
          stakeholderEmails: removedManagerEmails,
          stakeholderType: EMAIL_TYPE.USER_MANAGER_CLINIC_REMOVED,
          stakeholderData,
        });
      }
    }

    return;
  }

  if (action === NOTIFICATION_EMAIL_ACTION.DELETED) {
    const stakeholderEmails = await resolveClinicStakeholderEmails(
      prisma,
      clinic.id,
    );

    await dispatchNotificationEmails({
      actor: authContext,
      config,
      adminType: EMAIL_TYPE.ADMIN_ENTITY_DELETED,
      adminData: auditData,
      stakeholderEmails,
      stakeholderType: EMAIL_TYPE.USER_CLINIC_DELETED,
      stakeholderData,
    });
  }
};
