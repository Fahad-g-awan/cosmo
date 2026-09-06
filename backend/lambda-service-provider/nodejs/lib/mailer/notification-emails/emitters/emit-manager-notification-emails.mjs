import {
  resolveClinicIdsStakeholderEmails,
  resolveClinicStakeholderEmails,
  resolveManagerEmailsByIds,
} from "../recipient-resolvers.mjs";
import { dispatchNotificationEmails } from "../dispatch-notification-emails.mjs";
import { dispatchOversightNotification } from "../dispatch-oversight-notification.mjs";
import { emitEntityUpdateNotificationEmails } from "../../notify.mjs";
import { adminAuditPayload } from "../actor-context.mjs";
import { NOTIFICATION_EMAIL_ACTION } from "../notification-email-actions.mjs";
import { buildMailUrls } from "../../mail-urls.mjs";
import { dispatchEmail } from "../../dispatch-email.mjs";
import { EMAIL_TYPE } from "../../mailer.config.mjs";
import { diffIdSets } from "../email-utils.mjs";

/**
 * Send manager create/update/delete notification emails.
 *
 * @param {{
 *   action: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   ctx: { authContext?: object, config: object, prisma: import("@prisma/client").PrismaClient },
 *   manager: { id: string, email?: string, fullName?: string, firstName?: string },
 *   clinicIds?: string[],
 *   clinicNames?: string[],
 *   previousClinicIds?: string[],
 *   isSelfUpdate?: boolean,
 *   identityUpdates?: Record<string, unknown>,
 *   profileUpdated?: boolean,
 * }} params
 */
export const emitManagerNotificationEmails = async ({
  action,
  ctx,
  manager,
  clinicIds = [],
  clinicNames = [],
  previousClinicIds = [],
  isSelfUpdate = false,
  identityUpdates = {},
  profileUpdated = false,
}) => {
  const { authContext, config, prisma } = ctx;
  const managerLabel = manager.fullName || manager.firstName || manager.email;
  const auditData = adminAuditPayload({
    authContext,
    entityType: "clinic manager",
    entityLabel: managerLabel ?? manager.id,
    entityId: manager.id,
  });

  if (action === NOTIFICATION_EMAIL_ACTION.CREATED) {
    const { signInUrl, dashboardUrl } = buildMailUrls(config);

    if (manager.email) {
      await dispatchEmail({
        to: manager.email,
        type: EMAIL_TYPE.WELCOME_MANAGER,
        data: {
          firstName: manager.firstName,
          fullName: manager.fullName,
          email: manager.email,
          clinicNames,
          signInUrl,
          dashboardUrl,
        },
        config,
      });
    }

    const stakeholderEmails = await resolveClinicIdsStakeholderEmails(
      prisma,
      clinicIds,
    );
    const managerEmails = await resolveManagerEmailsByIds(prisma, [manager.id]);
    const clinicLabel = clinicNames.length
      ? clinicNames.join(", ")
      : clinicIds[0] ?? null;

    await dispatchNotificationEmails({
      actor: authContext,
      config,
      adminType: EMAIL_TYPE.ADMIN_USER_PROVISIONED,
      adminData: auditData,
      stakeholderEmails: [...stakeholderEmails, ...managerEmails],
      stakeholderType: EMAIL_TYPE.USER_MANAGER_CLINIC_ASSIGNED,
      stakeholderData: {
        ...auditData,
        clinicName: clinicLabel,
        managerName: managerLabel,
      },
    });

    return;
  }

  if (action === NOTIFICATION_EMAIL_ACTION.UPDATED) {
    let clinicAssignmentChanged = false;

    if (clinicIds !== undefined) {
      const { added, removed } = diffIdSets(previousClinicIds, clinicIds);
      const affectedClinicIds = [...new Set([...added, ...removed])];

      if (affectedClinicIds.length) {
        clinicAssignmentChanged = true;
        const clinics = await prisma.clinic.findMany({
          where: { id: { in: affectedClinicIds }, deleted: false },
          select: { id: true, name: true },
        });
        const clinicById = new Map(
          clinics.map((clinic) => [clinic.id, clinic]),
        );

        for (const clinicId of added) {
          const clinic = clinicById.get(clinicId);
          const stakeholderEmails = await resolveClinicStakeholderEmails(
            prisma,
            clinicId,
          );
          const managerEmails = await resolveManagerEmailsByIds(prisma, [
            manager.id,
          ]);

          await dispatchNotificationEmails({
            actor: authContext,
            config,
            includeOversight: false,
            stakeholderEmails: [...stakeholderEmails, ...managerEmails],
            stakeholderType: EMAIL_TYPE.USER_MANAGER_CLINIC_ASSIGNED,
            stakeholderData: {
              ...auditData,
              clinicName: clinic?.name ?? clinicId,
              managerName: managerLabel,
            },
          });
        }

        for (const clinicId of removed) {
          const clinic = clinicById.get(clinicId);
          const stakeholderEmails = await resolveClinicStakeholderEmails(
            prisma,
            clinicId,
          );
          const managerEmails = await resolveManagerEmailsByIds(prisma, [
            manager.id,
          ]);

          await dispatchNotificationEmails({
            actor: authContext,
            config,
            includeOversight: false,
            stakeholderEmails: [...stakeholderEmails, ...managerEmails],
            stakeholderType: EMAIL_TYPE.USER_MANAGER_CLINIC_REMOVED,
            stakeholderData: {
              ...auditData,
              clinicName: clinic?.name ?? clinicId,
              managerName: managerLabel,
            },
          });
        }
      }
    }

    await emitEntityUpdateNotificationEmails({
      isSelfUpdate,
      authContext,
      config,
      targetEmail: manager.email,
      targetName: managerLabel,
      targetId: manager.id,
      entityType: "clinic manager",
      identityUpdates,
      profileUpdated,
    });

    const hasStaffSideUpdate =
      profileUpdated || Object.keys(identityUpdates).length > 0;

    if (clinicAssignmentChanged && !hasStaffSideUpdate) {
      await dispatchOversightNotification({
        config,
        authContext,
        isSelfUpdate,
        identityUpdates,
        adminType: EMAIL_TYPE.ADMIN_ENTITY_UPDATED,
        adminData: auditData,
      });
    }

    return;
  }

  if (action === NOTIFICATION_EMAIL_ACTION.DELETED) {
    const stakeholderEmails = await resolveClinicIdsStakeholderEmails(
      prisma,
      previousClinicIds,
    );

    await dispatchNotificationEmails({
      actor: authContext,
      config,
      adminType: EMAIL_TYPE.ADMIN_ENTITY_DELETED,
      adminData: auditData,
      stakeholderEmails,
      stakeholderType: EMAIL_TYPE.USER_MANAGER_DELETED,
      stakeholderData: {
        ...auditData,
        managerName: managerLabel,
        clinicName: null,
      },
      actorConfirmType: EMAIL_TYPE.USER_STAFF_ACTION_DELETED,
      actorConfirmData: {
        entityType: "clinic manager",
        entityLabel: managerLabel,
        entityId: manager.id,
      },
    });
  }
};
