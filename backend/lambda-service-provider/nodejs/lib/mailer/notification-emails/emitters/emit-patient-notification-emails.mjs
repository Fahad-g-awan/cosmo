import { dispatchNotificationEmails } from "../dispatch-notification-emails.mjs";
import { NOTIFICATION_EMAIL_ACTION } from "../notification-email-actions.mjs";
import { USER_ROLES } from "../../../../constants/auth/roles.constants.mjs";
import { emitEntityUpdateNotificationEmails } from "../../notify.mjs";
import { isCosmediateAdminActor } from "../actor-routing.mjs";
import { adminAuditPayload } from "../actor-context.mjs";
import { dispatchEmail } from "../../dispatch-email.mjs";
import { EMAIL_TYPE } from "../../mailer.config.mjs";
import { buildMailUrls } from "../../mail-urls.mjs";

/**
 * Send patient create/update/delete notification emails.
 *
 * @param {{
 *   action: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   ctx: { authContext?: object, config: object, prisma?: import("@prisma/client").PrismaClient },
 *   patient: { id: string, email?: string, fullName?: string, firstName?: string },
 *   creator?: { actorEmail?: string, actorRole?: string, actorDisplayName?: string },
 *   clinicName?: string,
 *   isSelfUpdate?: boolean,
 *   identityUpdates?: Record<string, unknown>,
 *   profileUpdated?: boolean,
 * }} params
 */
export const emitPatientNotificationEmails = async ({
  action,
  ctx,
  patient,
  creator = {},
  clinicName = "",
  isSelfUpdate = false,
  identityUpdates = {},
  profileUpdated = false,
}) => {
  const { authContext, config } = ctx;
  const patientLabel = patient.fullName || patient.firstName || patient.email;
  const auditData = adminAuditPayload({
    authContext,
    entityType: "patient",
    entityLabel: patientLabel ?? patient.id,
    entityId: patient.id,
  });

  if (action === NOTIFICATION_EMAIL_ACTION.CREATED) {
    const { signInUrl } = buildMailUrls(config);
    const creatorRole = creator.actorRole ?? "";

    if (patient.email) {
      await dispatchEmail({
        to: patient.email,
        type: EMAIL_TYPE.WELCOME_PATIENT,
        data: {
          variant: "staff_created",
          patientName: patientLabel,
          patientEmail: patient.email,
          inviterRole: creatorRole,
          inviterName: creator.actorDisplayName ?? "",
          clinicName,
          specialistName:
            creatorRole === USER_ROLES.SPECIALIST
              ? (creator.actorDisplayName ?? "")
              : "",
          signInUrl,
        },
        config,
      });
    }

    const creatorEmails =
      !isCosmediateAdminActor(authContext) && creator.actorEmail
        ? [creator.actorEmail]
        : [];

    await dispatchNotificationEmails({
      actor: authContext,
      config,
      adminType: EMAIL_TYPE.ADMIN_USER_PROVISIONED,
      adminData: auditData,
      stakeholderEmails: creatorEmails,
      stakeholderType: EMAIL_TYPE.USER_PATIENT_CREATOR_CONFIRM,
      stakeholderData: {
        ...auditData,
        patientName: patientLabel,
        clinicName: clinicName || null,
      },
    });

    return;
  }

  if (action === NOTIFICATION_EMAIL_ACTION.UPDATED) {
    await emitEntityUpdateNotificationEmails({
      isSelfUpdate,
      authContext,
      config,
      targetEmail: patient.email,
      targetName: patientLabel,
      targetId: patient.id,
      entityType: "patient",
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
      targetEmail: patient.email,
      targetType: EMAIL_TYPE.USER_PATIENT_DELETED,
      targetData: {
        name: patientLabel,
        ...auditData,
      },
      actorConfirmType: EMAIL_TYPE.USER_STAFF_ACTION_DELETED,
      actorConfirmData: {
        entityType: "patient",
        entityLabel: patientLabel,
        entityId: patient.id,
      },
    });
  }
};
