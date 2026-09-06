import {
  resolveClinicIdsStakeholderEmails,
  resolveClinicStakeholderEmails,
  resolveSpecialistClinicStakeholderEmails,
  resolveSpecialistEmailsByIds,
  resolveSpecialistIdsStakeholderEmails,
} from "../recipient-resolvers.mjs";
import { dispatchNotificationEmails } from "../dispatch-notification-emails.mjs";
import { dispatchOversightNotification } from "../dispatch-oversight-notification.mjs";
import { NOTIFICATION_EMAIL_ACTION } from "../notification-email-actions.mjs";
import { emitEntityUpdateNotificationEmails } from "../../notify.mjs";
import { dispatchEmail } from "../../dispatch-email.mjs";
import { adminAuditPayload } from "../actor-context.mjs";
import { buildMailUrls } from "../../mail-urls.mjs";
import { EMAIL_TYPE } from "../../mailer.config.mjs";
import { diffIdSets } from "../email-utils.mjs";

/**
 * Send specialist create/update/delete notification emails.
 *
 * @param {{
 *   action: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   ctx: { authContext?: object, config: object, prisma: import("@prisma/client").PrismaClient },
 *   specialist: { id: string, email?: string, fullName?: string, firstName?: string },
 *   clinicIds?: string[],
 *   clinicNames?: string[],
 *   previousClinicIds?: string[],
 *   isSelfUpdate?: boolean,
 *   identityUpdates?: Record<string, unknown>,
 *   profileUpdated?: boolean,
 * }} params
 */
export const emitSpecialistNotificationEmails = async ({
  action,
  ctx,
  specialist,
  clinicIds = [],
  clinicNames = [],
  previousClinicIds = [],
  isSelfUpdate = false,
  identityUpdates = {},
  profileUpdated = false,
}) => {
  const { authContext, config, prisma } = ctx;
  const specialistLabel =
    specialist.fullName || specialist.firstName || specialist.email;
  const auditData = adminAuditPayload({
    authContext,
    entityType: "specialist",
    entityLabel: specialistLabel ?? specialist.id,
    entityId: specialist.id,
  });
  const stakeholderData = {
    specialistName: specialistLabel,
    ...auditData,
  };

  if (action === NOTIFICATION_EMAIL_ACTION.CREATED) {
    const { signInUrl, dashboardUrl } = buildMailUrls(config);

    if (specialist.email) {
      await dispatchEmail({
        to: specialist.email,
        type: EMAIL_TYPE.WELCOME_SPECIALIST,
        data: {
          firstName: specialist.firstName,
          fullName: specialist.fullName,
          email: specialist.email,
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
    const specialistEmails = await resolveSpecialistEmailsByIds(prisma, [
      specialist.id,
    ]);
    const clinicLabel = clinicNames.length
      ? clinicNames.join(", ")
      : (clinicIds[0] ?? null);

    await dispatchNotificationEmails({
      actor: authContext,
      config,
      adminType: EMAIL_TYPE.ADMIN_USER_PROVISIONED,
      adminData: auditData,
      stakeholderEmails: [...stakeholderEmails, ...specialistEmails],
      stakeholderType: EMAIL_TYPE.USER_SPECIALIST_CLINIC_ASSIGNED,
      stakeholderData: {
        ...stakeholderData,
        clinicName: clinicLabel,
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
        const specialistEmails = await resolveSpecialistEmailsByIds(prisma, [
          specialist.id,
        ]);

        for (const clinicId of added) {
          const clinic = clinicById.get(clinicId);
          const stakeholderEmails = await resolveClinicStakeholderEmails(
            prisma,
            clinicId,
          );

          await dispatchNotificationEmails({
            actor: authContext,
            config,
            includeOversight: false,
            stakeholderEmails: [...stakeholderEmails, ...specialistEmails],
            stakeholderType: EMAIL_TYPE.USER_SPECIALIST_CLINIC_ASSIGNED,
            stakeholderData: {
              ...stakeholderData,
              clinicName: clinic?.name ?? clinicId,
            },
          });
        }

        for (const clinicId of removed) {
          const clinic = clinicById.get(clinicId);
          const stakeholderEmails = await resolveClinicStakeholderEmails(
            prisma,
            clinicId,
          );

          await dispatchNotificationEmails({
            actor: authContext,
            config,
            includeOversight: false,
            stakeholderEmails: [...stakeholderEmails, ...specialistEmails],
            stakeholderType: EMAIL_TYPE.USER_SPECIALIST_CLINIC_REMOVED,
            stakeholderData: {
              ...stakeholderData,
              clinicName: clinic?.name ?? clinicId,
            },
          });
        }
      }
    }

    await emitEntityUpdateNotificationEmails({
      isSelfUpdate,
      authContext,
      config,
      targetEmail: specialist.email,
      targetName: specialistLabel,
      targetId: specialist.id,
      entityType: "specialist",
      identityUpdates,
      profileUpdated,
    });

    const hasStaffSideUpdate =
      profileUpdated || Object.keys(identityUpdates).length > 0;

    if (hasStaffSideUpdate) {
      const stakeholderEmails = await resolveSpecialistClinicStakeholderEmails(
        prisma,
        specialist.id,
      );

      await dispatchNotificationEmails({
        actor: authContext,
        config,
        includeOversight: false,
        stakeholderEmails,
        stakeholderType: EMAIL_TYPE.USER_SPECIALIST_UPDATED,
        stakeholderData,
      });
    } else if (clinicAssignmentChanged) {
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
    const stakeholderEmails = await resolveSpecialistIdsStakeholderEmails(
      prisma,
      [specialist.id],
    );

    await dispatchNotificationEmails({
      actor: authContext,
      config,
      adminType: EMAIL_TYPE.ADMIN_ENTITY_DELETED,
      adminData: auditData,
      stakeholderEmails,
      stakeholderType: EMAIL_TYPE.USER_SPECIALIST_DELETED,
      stakeholderData,
      actorConfirmType: EMAIL_TYPE.USER_STAFF_ACTION_DELETED,
      actorConfirmData: {
        entityType: "specialist",
        entityLabel: specialistLabel,
        entityId: specialist.id,
      },
    });
  }
};
