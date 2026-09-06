import {
  clinicContextBlock,
  ctaSignIn,
  transactionalEmail,
} from "./_transactional-utils.mjs";

/**
 * @param {{
 *   firstName?: string,
 *   fullName?: string,
 *   email?: string,
 *   clinicNames?: string[],
 *   signInUrl?: string,
 * }} data
 */
export const welcomeManagerEmail = (data) => {
  const name = data.fullName || data.firstName || data.email || "there";
  const signInUrl = data.signInUrl ?? "";
  const dashboardUrl = data.dashboardUrl ?? signInUrl;
  const clinicNames = Array.isArray(data.clinicNames) ? data.clinicNames : [];

  const body = `
    <p style="margin:0 0 16px;">Hi ${name}, welcome to Cosmediate.</p>
    <p style="margin:0 0 16px;">Your clinic manager account is ready. Check your other email for sign-in credentials, then sign in and change your password.</p>
    ${clinicContextBlock(clinicNames)}
    <p style="margin:0 0 16px;">Use your dashboard to manage clinic operations, staff, patients, and day-to-day workflows.</p>
    ${dashboardUrl ? ctaSignIn({ label: "Open clinic dashboard", href: dashboardUrl }) : ""}
  `;

  return transactionalEmail({
    title: "Welcome, clinic manager",
    subject: "Welcome to Cosmediate — clinic manager account",
    previewText: "Your Cosmediate clinic manager account is ready.",
    body,
  });
};
