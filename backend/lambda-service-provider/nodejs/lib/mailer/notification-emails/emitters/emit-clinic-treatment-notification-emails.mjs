import { dispatchNotificationEmails } from "../dispatch-notification-emails.mjs";
import { NOTIFICATION_EMAIL_ACTION } from "../notification-email-actions.mjs";
import { CLINIC_TREATMENT_EMAIL_KIND } from "../clinic-treatment-email-kinds.mjs";
import { adminAuditPayload } from "../actor-context.mjs";
import { EMAIL_TYPE } from "../../mailer.config.mjs";
import {
  resolveClinicStakeholderEmails,
  resolveSpecialistEmailsByIds,
} from "../recipient-resolvers.mjs";
import { dedupeEmails } from "../email-utils.mjs";

/**
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string[]} treatmentIds
 */
const resolveTreatmentNameById = async (prisma, treatmentIds = []) => {
  if (!treatmentIds.length) return new Map();

  const rows = await prisma.treatment.findMany({
    where: { id: { in: treatmentIds } },
    select: { id: true, name: true },
  });

  return new Map(rows.map((row) => [row.id, row.name]));
};

/**
 * @param {{
 *   authContext?: object,
 *   config: object,
 *   prisma: import("@prisma/client").PrismaClient,
 *   clinicId: string,
 *   clinicName?: string,
 *   treatmentName?: string,
 *   auditEntityType: string,
 *   auditEntityLabel: string,
 *   auditEntityId?: string,
 * }} params
 */
const dispatchClinicScopedTail = async ({
  authContext,
  config,
  prisma,
  clinicId,
  clinicName = "",
  treatmentName = "",
  auditEntityType,
  auditEntityLabel,
  auditEntityId,
}) => {
  const auditData = adminAuditPayload({
    authContext,
    entityType: auditEntityType,
    entityLabel: auditEntityLabel,
    entityId: auditEntityId ?? clinicId,
  });
  const stakeholderEmails = await resolveClinicStakeholderEmails(
    prisma,
    clinicId,
  );
  const stakeholderData = {
    ...auditData,
    clinicName: clinicName || null,
    treatmentName: treatmentName || null,
  };

  if (stakeholderEmails.length) {
    await dispatchNotificationEmails({
      actor: authContext,
      config,
      includeOversight: false,
      stakeholderEmails,
      stakeholderType: EMAIL_TYPE.USER_TREATMENT_ASSIGNED,
      stakeholderData,
    });
  }

  await dispatchNotificationEmails({
    actor: authContext,
    config,
    adminType: EMAIL_TYPE.ADMIN_ENTITY_UPDATED,
    adminData: auditData,
    actorConfirmType: EMAIL_TYPE.USER_STAFF_ACTION_UPDATED,
    actorConfirmData: {
      entityType: auditEntityType,
      entityLabel: auditEntityLabel,
      entityId: auditEntityId ?? clinicId,
    },
  });
};

/**
 * @param {{
 *   ctx: { authContext?: object, config: object, prisma: import("@prisma/client").PrismaClient },
 *   clinicId: string,
 *   clinicName?: string,
 *   addedTreatmentIds?: string[],
 *   removedTreatmentIds?: string[],
 * }} params
 */
const emitOfferingSyncEmails = async ({
  ctx,
  clinicId,
  clinicName = "",
  addedTreatmentIds = [],
  removedTreatmentIds = [],
}) => {
  const { authContext, config, prisma } = ctx;
  const auditData = adminAuditPayload({
    authContext,
    entityType: "clinic treatment offerings",
    entityLabel: clinicName || clinicId,
    entityId: clinicId,
  });
  const nameById = await resolveTreatmentNameById(prisma, [
    ...addedTreatmentIds,
    ...removedTreatmentIds,
  ]);
  const clinicStakeholders = await resolveClinicStakeholderEmails(
    prisma,
    clinicId,
  );

  for (const treatmentId of addedTreatmentIds) {
    await dispatchNotificationEmails({
      actor: authContext,
      config,
      includeOversight: false,
      stakeholderEmails: clinicStakeholders,
      stakeholderType: EMAIL_TYPE.USER_TREATMENT_ASSIGNED,
      stakeholderData: {
        ...auditData,
        clinicName: clinicName || null,
        treatmentName: nameById.get(treatmentId) ?? treatmentId,
      },
    });
  }

  for (const treatmentId of removedTreatmentIds) {
    await dispatchNotificationEmails({
      actor: authContext,
      config,
      includeOversight: false,
      stakeholderEmails: clinicStakeholders,
      stakeholderType: EMAIL_TYPE.USER_TREATMENT_REMOVED,
      stakeholderData: {
        ...auditData,
        clinicName: clinicName || null,
        treatmentName: nameById.get(treatmentId) ?? treatmentId,
      },
    });
  }

  await dispatchNotificationEmails({
    actor: authContext,
    config,
    adminType: EMAIL_TYPE.ADMIN_ENTITY_UPDATED,
    adminData: auditData,
    actorConfirmType: EMAIL_TYPE.USER_STAFF_ACTION_UPDATED,
    actorConfirmData: {
      entityType: "clinic treatment offerings",
      entityLabel: clinicName || clinicId,
      entityId: clinicId,
    },
  });
};

/**
 * @param {{
 *   ctx: { authContext?: object, config: object, prisma: import("@prisma/client").PrismaClient },
 *   clinicId: string,
 *   clinicName?: string,
 *   treatmentName?: string,
 *   clinicTreatmentId?: string,
 * }} params
 */
const emitSubTreatmentSyncEmails = async ({
  ctx,
  clinicId,
  clinicName = "",
  treatmentName = "",
  clinicTreatmentId,
}) => {
  const label = treatmentName
    ? `${treatmentName} (${clinicName || clinicId})`
    : clinicName || clinicId;

  await dispatchClinicScopedTail({
    authContext: ctx.authContext,
    config: ctx.config,
    prisma: ctx.prisma,
    clinicId,
    clinicName,
    treatmentName,
    auditEntityType: "clinic sub-treatments",
    auditEntityLabel: label,
    auditEntityId: clinicTreatmentId,
  });
};

/**
 * @param {{
 *   ctx: { authContext?: object, config: object, prisma: import("@prisma/client").PrismaClient },
 *   clinicId: string,
 *   clinicName?: string,
 *   treatmentName?: string,
 *   clinicTreatmentId?: string,
 *   addedSpecialistIds?: string[],
 *   removedSpecialistIds?: string[],
 * }} params
 */
const emitAssignmentSyncEmails = async ({
  ctx,
  clinicId,
  clinicName = "",
  treatmentName = "",
  clinicTreatmentId,
  addedSpecialistIds = [],
  removedSpecialistIds = [],
}) => {
  const { authContext, config, prisma } = ctx;
  const auditData = adminAuditPayload({
    authContext,
    entityType: "clinic specialist treatment assignment",
    entityLabel: treatmentName
      ? `${treatmentName} (${clinicName || clinicId})`
      : clinicName || clinicId,
    entityId: clinicTreatmentId ?? clinicId,
  });
  const clinicStakeholders = await resolveClinicStakeholderEmails(
    prisma,
    clinicId,
  );

  const notifySpecialists = async (specialistIds, stakeholderType) => {
    for (const specialistId of specialistIds) {
      const specialistEmails = await resolveSpecialistEmailsByIds(prisma, [
        specialistId,
      ]);

      await dispatchNotificationEmails({
        actor: authContext,
        config,
        includeOversight: false,
        stakeholderEmails: dedupeEmails([
          ...clinicStakeholders,
          ...specialistEmails,
        ]),
        stakeholderType,
        stakeholderData: {
          ...auditData,
          clinicName: clinicName || null,
          treatmentName: treatmentName || null,
        },
      });
    }
  };

  await notifySpecialists(addedSpecialistIds, EMAIL_TYPE.USER_TREATMENT_ASSIGNED);
  await notifySpecialists(removedSpecialistIds, EMAIL_TYPE.USER_TREATMENT_REMOVED);

  await dispatchNotificationEmails({
    actor: authContext,
    config,
    adminType: EMAIL_TYPE.ADMIN_ENTITY_UPDATED,
    adminData: auditData,
    actorConfirmType: EMAIL_TYPE.USER_STAFF_ACTION_UPDATED,
    actorConfirmData: {
      entityType: "clinic specialist treatment assignment",
      entityLabel: auditData.entityLabel,
      entityId: clinicTreatmentId ?? clinicId,
    },
  });
};

/**
 * Clinic-scoped treatment result CRUD (gallery at clinic level).
 *
 * @param {{
 *   action: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   ctx: { authContext?: object, config: object, prisma: import("@prisma/client").PrismaClient },
 *   clinicId: string,
 *   clinicName?: string,
 *   treatmentName?: string,
 *   resultId: string,
 * }} params
 */
const emitClinicResultEmails = async ({
  action,
  ctx,
  clinicId,
  clinicName = "",
  treatmentName = "",
  resultId,
}) => {
  const { authContext, config, prisma } = ctx;
  const label = treatmentName
    ? `${treatmentName} result (${clinicName || clinicId})`
    : clinicName || clinicId;

  const auditData = adminAuditPayload({
    authContext,
    entityType: "clinic treatment result",
    entityLabel: label,
    entityId: resultId,
  });

  const adminTypeByAction = {
    [NOTIFICATION_EMAIL_ACTION.CREATED]: EMAIL_TYPE.ADMIN_ENTITY_CREATED,
    [NOTIFICATION_EMAIL_ACTION.UPDATED]: EMAIL_TYPE.ADMIN_ENTITY_UPDATED,
    [NOTIFICATION_EMAIL_ACTION.DELETED]: EMAIL_TYPE.ADMIN_ENTITY_DELETED,
  };

  const stakeholderEmails = await resolveClinicStakeholderEmails(
    prisma,
    clinicId,
  );
  const stakeholderData = {
    ...auditData,
    clinicName: clinicName || null,
    treatmentName: treatmentName || null,
  };

  if (
    action !== NOTIFICATION_EMAIL_ACTION.DELETED &&
    stakeholderEmails.length
  ) {
    await dispatchNotificationEmails({
      actor: authContext,
      config,
      includeOversight: false,
      stakeholderEmails,
      stakeholderType: EMAIL_TYPE.USER_TREATMENT_ASSIGNED,
      stakeholderData,
    });
  }

  await dispatchNotificationEmails({
    actor: authContext,
    config,
    adminType: adminTypeByAction[action],
    adminData: auditData,
    actorConfirmType:
      action === NOTIFICATION_EMAIL_ACTION.DELETED
        ? EMAIL_TYPE.USER_STAFF_ACTION_DELETED
        : EMAIL_TYPE.USER_STAFF_ACTION_UPDATED,
    actorConfirmData: {
      entityType: "clinic treatment result",
      entityLabel: label,
      entityId: resultId,
    },
  });
};

/**
 * Send clinic-scoped treatment notification emails.
 *
 * @param {{
 *   kind: typeof CLINIC_TREATMENT_EMAIL_KIND[keyof typeof CLINIC_TREATMENT_EMAIL_KIND],
 *   ctx: { authContext?: object, config: object, prisma: import("@prisma/client").PrismaClient },
 *   action?: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   clinicId: string,
 *   clinicName?: string,
 *   treatmentName?: string,
 *   clinicTreatmentId?: string,
 *   resultId?: string,
 *   addedTreatmentIds?: string[],
 *   removedTreatmentIds?: string[],
 *   addedSpecialistIds?: string[],
 *   removedSpecialistIds?: string[],
 * }} params
 */
export const emitClinicTreatmentNotificationEmails = async (params) => {
  switch (params.kind) {
    case CLINIC_TREATMENT_EMAIL_KIND.OFFERING_SYNC:
      return emitOfferingSyncEmails(params);
    case CLINIC_TREATMENT_EMAIL_KIND.SUB_TREATMENT_SYNC:
      return emitSubTreatmentSyncEmails(params);
    case CLINIC_TREATMENT_EMAIL_KIND.ASSIGNMENT_SYNC:
      return emitAssignmentSyncEmails(params);
    default:
      if (!params.action || !params.resultId) return;
      return emitClinicResultEmails({
        action: params.action,
        ctx: params.ctx,
        clinicId: params.clinicId,
        clinicName: params.clinicName,
        treatmentName: params.treatmentName,
        resultId: params.resultId,
      });
  }
};
