export { renderEmail } from "./render-email.mjs";
export { sendEmail } from "./send-email.mjs";
export { queueEmail } from "./queue-email.mjs";
export { dispatchEmail } from "./dispatch-email.mjs";
export { resolveMailConfig } from "./resolve-mail-config.mjs";
export { buildMailUrls, buildReviewUrl, formatClinicNames } from "./mail-urls.mjs";
export { sendAdminNotification, sendUserNotification } from "./send/index.mjs";
export { sendDevAlertEmail } from "./dev-alerts/send-dev-alert-email.mjs";
export { reportDevAlert } from "./dev-alerts/report-dev-alert.mjs";
export { analyzeDlqMessage, parseQueueNameFromArn } from "./dlq/analyze-dlq-message.mjs";
export { sendDlqAlertEmail } from "./dlq/send-dlq-alert-email.mjs";
export { DLQ_MESSAGE_KIND } from "./dlq/dlq-message-kinds.mjs";
export { emitEntityUpdateNotificationEmails } from "./notify.mjs";
export {
  NOTIFICATION_EMAIL_ACTION,
  emitClinicNotificationEmails,
  emitManagerNotificationEmails,
  emitClinicCategoryNotificationEmails,
  emitSpecialistNotificationEmails,
  emitPatientNotificationEmails,
  emitAdminNotificationEmails,
  emitTreatmentNotificationEmails,
  emitBlogNotificationEmails,
  emitClinicTreatmentNotificationEmails,
  emitReviewNotificationEmails,
  CLINIC_TREATMENT_EMAIL_KIND,
  REVIEW_NOTIFICATION_SUBJECT,
} from "./notification-emails/index.mjs";
export { hasTemplate, resolveTemplate } from "./template-registry.mjs";
export { getEmailCategory, getEmailTypeMeta } from "./email-categories.mjs";

export {
  EMAIL_TYPE,
  EMAIL_CATEGORY,
  EMAIL_TYPE_META,
  DEFAULT_FROM_EMAIL,
  DEFAULT_APP_BASE_URL,
  DEFAULT_APP_DASHBOARD_URL,
} from "./mailer.config.mjs";
