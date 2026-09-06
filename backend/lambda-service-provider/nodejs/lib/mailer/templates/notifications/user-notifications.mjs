import { escapeHtml } from "../_layout.mjs";
import { EMAIL_TYPE } from "../../mailer.config.mjs";
import { userNotificationEmail } from "./_notification-utils.mjs";

/**
 * @param {Record<string, unknown>} data
 */
const greetingFor = (data) => {
  const name = data.name ?? data.firstName ?? data.email;
  return name ? `Hi ${escapeHtml(String(name))},` : "Hi there,";
};

/**
 * @param {string} type
 * @param {Record<string, unknown>} data
 * @param {{ subject: string, title: string, previewText: string, paragraphs: (data: Record<string, unknown>) => string[] }} copy
 */
const notificationFromType = (type, data, copy) =>
  userNotificationEmail({
    subject: copy.subject,
    title: copy.title,
    previewText: copy.previewText,
    greeting: greetingFor(data),
    paragraphs: copy.paragraphs(data),
  });

/** @param {Record<string, unknown>} data */
export const profileUpdatedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_PROFILE_UPDATED, data, {
    subject: "Your Cosmediate profile was updated",
    title: "Profile updated",
    previewText: "Your profile changes were saved successfully.",
    paragraphs: () => [
      "Your Cosmediate profile was updated successfully.",
      "If you did not make this change, please sign in and review your account settings.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const accountUpdatedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_ACCOUNT_UPDATED, data, {
    subject: "Your Cosmediate account was updated",
    title: "Account updated",
    previewText: "Your account settings were changed.",
    paragraphs: (d) => [
      `Your account settings were updated${d.changeSummary ? `: <strong>${escapeHtml(String(d.changeSummary))}</strong>` : ""}.`,
      "If this wasn't you, secure your account immediately and contact support.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const treatmentAssignedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_TREATMENT_ASSIGNED, data, {
    subject: "A treatment was added to your plan",
    title: "Treatment added",
    previewText: "A new treatment was added to your Cosmediate plan.",
    paragraphs: (d) => [
      d.treatmentName
        ? `<strong>${escapeHtml(String(d.treatmentName))}</strong> was added to your treatment plan.`
        : "A new treatment was added to your plan.",
      d.clinicName
        ? `Clinic: <strong>${escapeHtml(String(d.clinicName))}</strong>.`
        : "",
    ].filter(Boolean),
  });

/** @param {Record<string, unknown>} data */
export const treatmentRemovedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_TREATMENT_REMOVED, data, {
    subject: "A treatment was removed from your plan",
    title: "Treatment removed",
    previewText: "A treatment was removed from your Cosmediate plan.",
    paragraphs: (d) => [
      d.treatmentName
        ? `<strong>${escapeHtml(String(d.treatmentName))}</strong> was removed from your treatment plan.`
        : "A treatment was removed from your plan.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const appointmentBookedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_APPOINTMENT_BOOKED, data, {
    subject: "Your appointment is confirmed",
    title: "Appointment confirmed",
    previewText: "Your Cosmediate appointment is booked.",
    paragraphs: (d) => [
      "Your appointment is confirmed.",
      d.appointmentAt
        ? `When: <strong>${escapeHtml(new Date(String(d.appointmentAt)).toUTCString())}</strong>`
        : "",
      d.clinicName
        ? `Clinic: <strong>${escapeHtml(String(d.clinicName))}</strong>`
        : "",
      d.specialistName
        ? `Specialist: <strong>${escapeHtml(String(d.specialistName))}</strong>`
        : "",
    ].filter(Boolean),
  });

/** @param {Record<string, unknown>} data */
export const appointmentCancelledEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_APPOINTMENT_CANCELLED, data, {
    subject: "Your appointment was cancelled",
    title: "Appointment cancelled",
    previewText: "Your Cosmediate appointment was cancelled.",
    paragraphs: (d) => [
      "Your appointment was cancelled.",
      d.appointmentAt
        ? `Originally scheduled for: <strong>${escapeHtml(new Date(String(d.appointmentAt)).toUTCString())}</strong>`
        : "",
      d.reason ? `Reason: ${escapeHtml(String(d.reason))}` : "",
    ].filter(Boolean),
  });

/** @param {Record<string, unknown>} data */
export const appointmentRescheduledEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_APPOINTMENT_RESCHEDULED, data, {
    subject: "Your appointment was rescheduled",
    title: "Appointment rescheduled",
    previewText: "Your Cosmediate appointment has a new date and time.",
    paragraphs: (d) => [
      "Your appointment was rescheduled.",
      d.previousAt
        ? `Previous time: ${escapeHtml(new Date(String(d.previousAt)).toUTCString())}`
        : "",
      d.appointmentAt
        ? `New time: <strong>${escapeHtml(new Date(String(d.appointmentAt)).toUTCString())}</strong>`
        : "",
      d.clinicName
        ? `Clinic: <strong>${escapeHtml(String(d.clinicName))}</strong>`
        : "",
    ].filter(Boolean),
  });

/** @param {Record<string, unknown>} data */
export const clinicUpdatedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_CLINIC_UPDATED, data, {
    subject: "Clinic profile updated",
    title: "Clinic updated",
    previewText: "A clinic profile on Cosmediate was updated.",
    paragraphs: (d) => [
      d.clinicName
        ? `The clinic <strong>${escapeHtml(String(d.clinicName))}</strong> was updated.`
        : "A clinic profile linked to your organization was updated.",
      d.actorName
        ? `Updated by: <strong>${escapeHtml(String(d.actorName))}</strong>.`
        : "",
    ].filter(Boolean),
  });

/** @param {Record<string, unknown>} data */
export const clinicDeletedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_CLINIC_DELETED, data, {
    subject: "Clinic removed",
    title: "Clinic deleted",
    previewText: "A clinic profile on Cosmediate was removed.",
    paragraphs: (d) => [
      d.clinicName
        ? `The clinic <strong>${escapeHtml(String(d.clinicName))}</strong> was removed from Cosmediate.`
        : "A clinic profile linked to your organization was removed.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const managerClinicAssignedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_MANAGER_CLINIC_ASSIGNED, data, {
    subject: "Clinic assignment updated",
    title: "Clinic assigned",
    previewText: "Your clinic assignment on Cosmediate was updated.",
    paragraphs: (d) => [
      d.managerName
        ? `<strong>${escapeHtml(String(d.managerName))}</strong> is now linked to`
        : "You are now linked to",
      d.clinicName
        ? ` clinic <strong>${escapeHtml(String(d.clinicName))}</strong>.`
        : " a clinic on Cosmediate.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const managerClinicRemovedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_MANAGER_CLINIC_REMOVED, data, {
    subject: "Clinic assignment removed",
    title: "Clinic removed",
    previewText: "A clinic assignment on Cosmediate was removed.",
    paragraphs: (d) => [
      d.managerName
        ? `<strong>${escapeHtml(String(d.managerName))}</strong> is no longer linked to`
        : "You are no longer linked to",
      d.clinicName
        ? ` clinic <strong>${escapeHtml(String(d.clinicName))}</strong>.`
        : " a clinic on Cosmediate.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const managerDeletedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_MANAGER_DELETED, data, {
    subject: "Clinic manager removed",
    title: "Manager removed",
    previewText: "A clinic manager account was removed.",
    paragraphs: (d) => [
      d.managerName
        ? `Manager <strong>${escapeHtml(String(d.managerName))}</strong> was removed from Cosmediate.`
        : "A clinic manager linked to your organization was removed.",
      d.clinicName
        ? `Clinic: <strong>${escapeHtml(String(d.clinicName))}</strong>.`
        : "",
    ].filter(Boolean),
  });

/** @param {Record<string, unknown>} data */
export const specialistClinicAssignedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_SPECIALIST_CLINIC_ASSIGNED, data, {
    subject: "Specialist clinic assignment updated",
    title: "Specialist assigned",
    previewText: "A specialist clinic assignment on Cosmediate was updated.",
    paragraphs: (d) => [
      d.specialistName
        ? `<strong>${escapeHtml(String(d.specialistName))}</strong> is now linked to`
        : "A specialist is now linked to",
      d.clinicName
        ? ` clinic <strong>${escapeHtml(String(d.clinicName))}</strong>.`
        : " a clinic on Cosmediate.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const specialistClinicRemovedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_SPECIALIST_CLINIC_REMOVED, data, {
    subject: "Specialist clinic assignment removed",
    title: "Specialist unassigned",
    previewText: "A specialist clinic assignment on Cosmediate was removed.",
    paragraphs: (d) => [
      d.specialistName
        ? `<strong>${escapeHtml(String(d.specialistName))}</strong> is no longer linked to`
        : "A specialist is no longer linked to",
      d.clinicName
        ? ` clinic <strong>${escapeHtml(String(d.clinicName))}</strong>.`
        : " a clinic on Cosmediate.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const specialistUpdatedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_SPECIALIST_UPDATED, data, {
    subject: "Specialist profile updated",
    title: "Specialist updated",
    previewText: "A specialist profile on Cosmediate was updated.",
    paragraphs: (d) => [
      d.specialistName
        ? `Specialist <strong>${escapeHtml(String(d.specialistName))}</strong> was updated.`
        : "A specialist linked to your clinic was updated.",
      d.actorName
        ? `Updated by: <strong>${escapeHtml(String(d.actorName))}</strong>.`
        : "",
    ].filter(Boolean),
  });

/** @param {Record<string, unknown>} data */
export const specialistDeletedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_SPECIALIST_DELETED, data, {
    subject: "Specialist removed",
    title: "Specialist deleted",
    previewText: "A specialist account was removed from Cosmediate.",
    paragraphs: (d) => [
      d.specialistName
        ? `Specialist <strong>${escapeHtml(String(d.specialistName))}</strong> was removed from Cosmediate.`
        : "A specialist linked to your clinic was removed.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const patientCreatorConfirmEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_PATIENT_CREATOR_CONFIRM, data, {
    subject: "Patient account created",
    title: "Patient added",
    previewText: "You successfully added a patient on Cosmediate.",
    paragraphs: (d) => [
      d.patientName
        ? `Patient <strong>${escapeHtml(String(d.patientName))}</strong> was added to Cosmediate.`
        : "A new patient account was created on Cosmediate.",
      d.clinicName
        ? `Clinic: <strong>${escapeHtml(String(d.clinicName))}</strong>.`
        : "",
    ].filter(Boolean),
  });

/** @param {Record<string, unknown>} data */
export const patientDeletedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_PATIENT_DELETED, data, {
    subject: "Your Cosmediate patient account was removed",
    title: "Account removed",
    previewText: "Your Cosmediate patient account was removed.",
    paragraphs: () => [
      "Your Cosmediate patient account was removed.",
      "If you believe this was a mistake, contact your clinic or Cosmediate support.",
    ],
  });

/** @param {Record<string, unknown>} data */
export const staffActionUpdatedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_STAFF_ACTION_UPDATED, data, {
    subject: "Update recorded",
    title: "Update confirmed",
    previewText: "Your update on Cosmediate was recorded.",
    paragraphs: (d) => [
      d.entityLabel
        ? `You updated <strong>${escapeHtml(String(d.entityType ?? "record"))}</strong> <strong>${escapeHtml(String(d.entityLabel))}</strong>.`
        : `You updated a ${escapeHtml(String(d.entityType ?? "record"))} on Cosmediate.`,
    ],
  });

/** @param {Record<string, unknown>} data */
export const staffActionDeletedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_STAFF_ACTION_DELETED, data, {
    subject: "Deletion recorded",
    title: "Deletion confirmed",
    previewText: "Your deletion on Cosmediate was recorded.",
    paragraphs: (d) => [
      d.entityLabel
        ? `You removed <strong>${escapeHtml(String(d.entityType ?? "record"))}</strong> <strong>${escapeHtml(String(d.entityLabel))}</strong>.`
        : `You removed a ${escapeHtml(String(d.entityType ?? "record"))} on Cosmediate.`,
    ],
  });

/** @param {Record<string, unknown>} data */
export const reviewReceivedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_REVIEW_RECEIVED, data, {
    subject: "New review received",
    title: "New review",
    previewText: "A new review was posted on Cosmediate.",
    paragraphs: (d) =>
      [
        d.targetName
          ? `A new review was posted for <strong>${escapeHtml(String(d.targetName))}</strong>.`
          : "A new review was posted on Cosmediate.",
        d.authorName
          ? `From: <strong>${escapeHtml(String(d.authorName))}</strong>.`
          : "",
        d.rating != null && d.rating !== ""
          ? `Rating: <strong>${escapeHtml(String(d.rating))}</strong>/5.`
          : "",
      ].filter(Boolean),
  });

/** @param {Record<string, unknown>} data */
export const reviewReplyReceivedEmail = (data) =>
  notificationFromType(EMAIL_TYPE.USER_REVIEW_REPLY_RECEIVED, data, {
    subject: "Someone replied to your review",
    title: "New reply on your review",
    previewText: "You received a reply to your Cosmediate review.",
    paragraphs: (d) =>
      [
        d.targetName
          ? `There is a new reply on your review of <strong>${escapeHtml(String(d.targetName))}</strong>.`
          : "There is a new reply on your review.",
        d.replierName
          ? `Reply from: <strong>${escapeHtml(String(d.replierName))}</strong>.`
          : "",
        d.reviewUrl
          ? `<a href="${escapeHtml(String(d.reviewUrl))}" style="color:#6968ec;text-decoration:none;">View the review</a>`
          : "Sign in to Cosmediate to read the reply.",
      ].filter(Boolean),
  });
