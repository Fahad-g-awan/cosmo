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
export const welcomeSpecialistEmail = (data) => {
  const name = data.fullName || data.firstName || data.email || "there";
  const signInUrl = data.signInUrl ?? "";
  const dashboardUrl = data.dashboardUrl ?? signInUrl;
  const clinicNames = Array.isArray(data.clinicNames) ? data.clinicNames : [];

  const body = `
    <p style="margin:0 0 16px;">Hi ${name}, welcome to Cosmediate.</p>
    <p style="margin:0 0 16px;">Your specialist account is ready. Your sign-in credentials were sent separately — please sign in and update your password right away.</p>
    ${clinicContextBlock(clinicNames)}
    <p style="margin:0 0 16px;">From your dashboard you can manage your profile, availability, treatments, and patient relationships.</p>
    ${dashboardUrl ? ctaSignIn({ label: "Go to your dashboard", href: dashboardUrl }) : ""}
  `;

  return transactionalEmail({
    title: "Welcome, specialist",
    subject: "Welcome to Cosmediate — specialist account",
    previewText: "Your Cosmediate specialist account is ready.",
    body,
  });
};
