import { devRuntimeErrorEmail } from "./templates/dev/dev-runtime-error.mjs";
import { devDlqMessageEmail } from "./templates/dev/dev-dlq-message.mjs";
import {
  entityCreatedEmail,
  entityDeletedEmail,
  entityUpdatedEmail,
  permissionsChangedEmail,
  sensitiveActionEmail,
  userProvisionedEmail,
} from "./templates/admin/admin-notifications.mjs";
import {
  accountUpdatedEmail,
  appointmentBookedEmail,
  appointmentCancelledEmail,
  appointmentRescheduledEmail,
  clinicDeletedEmail,
  clinicUpdatedEmail,
  managerClinicAssignedEmail,
  managerClinicRemovedEmail,
  managerDeletedEmail,
  patientCreatorConfirmEmail,
  patientDeletedEmail,
  staffActionDeletedEmail,
  staffActionUpdatedEmail,
  profileUpdatedEmail,
  reviewReceivedEmail,
  reviewReplyReceivedEmail,
  specialistClinicAssignedEmail,
  specialistClinicRemovedEmail,
  specialistDeletedEmail,
  specialistUpdatedEmail,
  treatmentAssignedEmail,
  treatmentRemovedEmail,
} from "./templates/notifications/user-notifications.mjs";
import { forgotPasswordResendCodeEmail } from "./templates/auth/forgot-password-resend-code.mjs";
import { socialAccountLinkedEmail } from "./templates/transactional/social-account-linked.mjs";
import { welcomeSpecialistEmail } from "./templates/transactional/welcome-specialist.mjs";
import { updateUserAttributeEmail } from "./templates/auth/update-user-attribute.mjs";
import { verifyUserAttributeEmail } from "./templates/auth/verify-user-attribute.mjs";
import { passwordChangedEmail } from "./templates/transactional/password-changed.mjs";
import { welcomeManagerEmail } from "./templates/transactional/welcome-manager.mjs";
import { welcomePatientEmail } from "./templates/transactional/welcome-patient.mjs";
import { signUpResendCodeEmail } from "./templates/auth/sign-up-resend-code.mjs";
import { welcomeAdminEmail } from "./templates/transactional/welcome-admin.mjs";
import { adminCreateUserEmail } from "./templates/auth/admin-create-user.mjs";
import { forgotPasswordEmail } from "./templates/auth/forgot-password.mjs";
import { authenticationEmail } from "./templates/auth/authentication.mjs";
import { signUpVerifyEmail } from "./templates/auth/sign-up-verify.mjs";
import { EMAIL_TYPE } from "./mailer.config.mjs";

/**
 * @type {Record<string, (data: Record<string, unknown>) => { subject: string, html: string, text?: string }>}
 */
const REGISTRY = {
  [EMAIL_TYPE.AUTH_ADMIN_CREATE_USER]: adminCreateUserEmail,
  [EMAIL_TYPE.AUTH_SIGN_UP]: signUpVerifyEmail,
  [EMAIL_TYPE.AUTH_SIGN_UP_RESEND]: signUpResendCodeEmail,
  [EMAIL_TYPE.AUTH_FORGOT_PASSWORD]: forgotPasswordEmail,
  [EMAIL_TYPE.AUTH_FORGOT_PASSWORD_RESEND]: forgotPasswordResendCodeEmail,
  [EMAIL_TYPE.AUTH_VERIFY_USER_ATTRIBUTE]: verifyUserAttributeEmail,
  [EMAIL_TYPE.AUTH_UPDATE_USER_ATTRIBUTE]: updateUserAttributeEmail,
  [EMAIL_TYPE.AUTH_AUTHENTICATION]: authenticationEmail,

  [EMAIL_TYPE.WELCOME_PATIENT]: welcomePatientEmail,
  [EMAIL_TYPE.WELCOME_SPECIALIST]: welcomeSpecialistEmail,
  [EMAIL_TYPE.WELCOME_MANAGER]: welcomeManagerEmail,
  [EMAIL_TYPE.WELCOME_ADMIN]: welcomeAdminEmail,
  [EMAIL_TYPE.PASSWORD_CHANGED]: passwordChangedEmail,
  [EMAIL_TYPE.SOCIAL_ACCOUNT_LINKED]: socialAccountLinkedEmail,

  [EMAIL_TYPE.DEV_RUNTIME_ERROR]: devRuntimeErrorEmail,
  [EMAIL_TYPE.DEV_DLQ_MESSAGE]: devDlqMessageEmail,

  [EMAIL_TYPE.ADMIN_USER_PROVISIONED]: userProvisionedEmail,
  [EMAIL_TYPE.ADMIN_PERMISSIONS_CHANGED]: permissionsChangedEmail,
  [EMAIL_TYPE.ADMIN_ENTITY_CREATED]: entityCreatedEmail,
  [EMAIL_TYPE.ADMIN_ENTITY_UPDATED]: entityUpdatedEmail,
  [EMAIL_TYPE.ADMIN_ENTITY_DELETED]: entityDeletedEmail,
  [EMAIL_TYPE.ADMIN_SENSITIVE_ACTION]: sensitiveActionEmail,

  [EMAIL_TYPE.USER_PROFILE_UPDATED]: profileUpdatedEmail,
  [EMAIL_TYPE.USER_ACCOUNT_UPDATED]: accountUpdatedEmail,
  [EMAIL_TYPE.USER_CLINIC_UPDATED]: clinicUpdatedEmail,
  [EMAIL_TYPE.USER_CLINIC_DELETED]: clinicDeletedEmail,
  [EMAIL_TYPE.USER_MANAGER_CLINIC_ASSIGNED]: managerClinicAssignedEmail,
  [EMAIL_TYPE.USER_MANAGER_CLINIC_REMOVED]: managerClinicRemovedEmail,
  [EMAIL_TYPE.USER_MANAGER_DELETED]: managerDeletedEmail,
  [EMAIL_TYPE.USER_SPECIALIST_CLINIC_ASSIGNED]: specialistClinicAssignedEmail,
  [EMAIL_TYPE.USER_SPECIALIST_CLINIC_REMOVED]: specialistClinicRemovedEmail,
  [EMAIL_TYPE.USER_SPECIALIST_UPDATED]: specialistUpdatedEmail,
  [EMAIL_TYPE.USER_SPECIALIST_DELETED]: specialistDeletedEmail,
  [EMAIL_TYPE.USER_PATIENT_CREATOR_CONFIRM]: patientCreatorConfirmEmail,
  [EMAIL_TYPE.USER_PATIENT_DELETED]: patientDeletedEmail,
  [EMAIL_TYPE.USER_STAFF_ACTION_UPDATED]: staffActionUpdatedEmail,
  [EMAIL_TYPE.USER_STAFF_ACTION_DELETED]: staffActionDeletedEmail,
  [EMAIL_TYPE.USER_TREATMENT_ASSIGNED]: treatmentAssignedEmail,
  [EMAIL_TYPE.USER_TREATMENT_REMOVED]: treatmentRemovedEmail,
  [EMAIL_TYPE.USER_APPOINTMENT_BOOKED]: appointmentBookedEmail,
  [EMAIL_TYPE.USER_APPOINTMENT_CANCELLED]: appointmentCancelledEmail,
  [EMAIL_TYPE.USER_APPOINTMENT_RESCHEDULED]: appointmentRescheduledEmail,
  [EMAIL_TYPE.USER_REVIEW_RECEIVED]: reviewReceivedEmail,
  [EMAIL_TYPE.USER_REVIEW_REPLY_RECEIVED]: reviewReplyReceivedEmail,
};

/**
 * @param {string} type — EMAIL_TYPE value
 * @returns {(data: Record<string, unknown>) => { subject: string, html: string, text?: string }}
 */
export const resolveTemplate = (type) => {
  const templateFn = REGISTRY[type];

  if (!templateFn) {
    throw new Error(
      `[mailer] No template registered for type="${type}". Implement it under lib/mailer/templates/.`,
    );
  }

  return templateFn;
};

/**
 * @param {string} type
 * @returns {boolean}
 */
export const hasTemplate = (type) => Boolean(REGISTRY[type]);

export { EMAIL_TYPE };
