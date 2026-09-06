import { sendUserNotification } from "../../send/send-user-notification.mjs";
import { buildReviewUrl } from "../../mail-urls.mjs";
import { EMAIL_TYPE } from "../../mailer.config.mjs";
import { dispatchNotificationEmails } from "../dispatch-notification-emails.mjs";
import { NOTIFICATION_EMAIL_ACTION } from "../notification-email-actions.mjs";
import { REVIEW_NOTIFICATION_SUBJECT } from "../review-notification-subject.mjs";
import { adminAuditPayload } from "../actor-context.mjs";
import { resolveReviewTargetStakeholderEmails } from "../recipient-resolvers.mjs";

/**
 * @param {{
 *   review: {
 *     id: string,
 *     targetEntityType?: string,
 *     targetEntityId?: string,
 *     targetName?: string | null,
 *     authorName?: string | null,
 *     authorEmail?: string | null,
 *     rating?: number | null,
 *   },
 * }} params
 */
const reviewStakeholderData = ({ review }) => ({
  targetName: review.targetName,
  authorName: review.authorName,
  rating: review.rating,
});

/**
 * Send review / reply notification emails.
 *
 * @param {{
 *   action: import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION[keyof import("../notification-email-actions.mjs").NOTIFICATION_EMAIL_ACTION],
 *   subject: typeof REVIEW_NOTIFICATION_SUBJECT[keyof typeof REVIEW_NOTIFICATION_SUBJECT],
 *   ctx: { authContext?: object, config: object, prisma: import("@prisma/client").PrismaClient },
 *   review: {
 *     id: string,
 *     targetEntityType?: string,
 *     targetEntityId?: string,
 *     targetName?: string | null,
 *     authorName?: string | null,
 *     authorEmail?: string | null,
 *     rating?: number | null,
 *   },
 *   reply?: {
 *     id?: string,
 *     authorName?: string | null,
 *   },
 * }} params
 */
export const emitReviewNotificationEmails = async ({
  action,
  subject,
  ctx,
  review,
  reply = {},
}) => {
  const { authContext, config, prisma } = ctx;
  const reviewLabel = review.targetName ?? review.id;

  if (subject === REVIEW_NOTIFICATION_SUBJECT.REVIEW) {
    if (action === NOTIFICATION_EMAIL_ACTION.CREATED) {
      const stakeholderEmails = await resolveReviewTargetStakeholderEmails(
        prisma,
        review.targetEntityType ?? "",
        review.targetEntityId ?? "",
      );

      await dispatchNotificationEmails({
        actor: authContext,
        config,
        includeOversight: false,
        stakeholderEmails,
        stakeholderType: EMAIL_TYPE.USER_REVIEW_RECEIVED,
        stakeholderData: reviewStakeholderData({ review }),
      });

      return;
    }

    if (
      action === NOTIFICATION_EMAIL_ACTION.UPDATED ||
      action === NOTIFICATION_EMAIL_ACTION.DELETED
    ) {
      const auditData = adminAuditPayload({
        authContext,
        entityType: "review",
        entityLabel: reviewLabel,
        entityId: review.id,
      });

      await dispatchNotificationEmails({
        actor: authContext,
        config,
        adminType:
          action === NOTIFICATION_EMAIL_ACTION.UPDATED
            ? EMAIL_TYPE.ADMIN_ENTITY_UPDATED
            : EMAIL_TYPE.ADMIN_ENTITY_DELETED,
        adminData: auditData,
        actorConfirmType:
          action === NOTIFICATION_EMAIL_ACTION.UPDATED
            ? EMAIL_TYPE.USER_STAFF_ACTION_UPDATED
            : EMAIL_TYPE.USER_STAFF_ACTION_DELETED,
        actorConfirmData: {
          entityType: "review",
          entityLabel: reviewLabel,
          entityId: review.id,
        },
      });
    }

    return;
  }

  if (subject === REVIEW_NOTIFICATION_SUBJECT.REPLY) {
    if (action === NOTIFICATION_EMAIL_ACTION.CREATED) {
      if (review.authorEmail) {
        await sendUserNotification({
          to: review.authorEmail,
          type: EMAIL_TYPE.USER_REVIEW_REPLY_RECEIVED,
          data: {
            name: review.authorName,
            targetName: review.targetName,
            replierName: reply.authorName,
            reviewUrl: buildReviewUrl(config),
          },
          config,
        });
      }

      return;
    }

    if (
      action === NOTIFICATION_EMAIL_ACTION.UPDATED ||
      action === NOTIFICATION_EMAIL_ACTION.DELETED
    ) {
      const replyLabel = reply.authorName
        ? `${reply.authorName} on ${reviewLabel}`
        : reviewLabel;
      const auditData = adminAuditPayload({
        authContext,
        entityType: "review reply",
        entityLabel: replyLabel,
        entityId: reply.id ?? review.id,
      });

      await dispatchNotificationEmails({
        actor: authContext,
        config,
        adminType:
          action === NOTIFICATION_EMAIL_ACTION.UPDATED
            ? EMAIL_TYPE.ADMIN_ENTITY_UPDATED
            : EMAIL_TYPE.ADMIN_ENTITY_DELETED,
        adminData: auditData,
        actorConfirmType:
          action === NOTIFICATION_EMAIL_ACTION.UPDATED
            ? EMAIL_TYPE.USER_STAFF_ACTION_UPDATED
            : EMAIL_TYPE.USER_STAFF_ACTION_DELETED,
        actorConfirmData: {
          entityType: "review reply",
          entityLabel: replyLabel,
          entityId: reply.id ?? review.id,
        },
      });
    }
  }
};
