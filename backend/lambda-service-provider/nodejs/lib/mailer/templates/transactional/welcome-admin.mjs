import { ctaSignIn, transactionalEmail } from "./_transactional-utils.mjs";

/**
 * @param {{
 *   firstName?: string,
 *   fullName?: string,
 *   email?: string,
 *   signInUrl?: string,
 *   dashboardUrl?: string,
 * }} data
 */
export const welcomeAdminEmail = (data) => {
  const name = data.fullName || data.firstName || data.email || "there";
  const signInUrl = data.signInUrl ?? "";
  const dashboardUrl = data.dashboardUrl ?? signInUrl;

  const body = `
    <p style="margin:0 0 16px;">Hi ${name}, your Cosmediate admin account is ready.</p>
    <p style="margin:0 0 16px;">Your sign-in credentials were sent in a separate email. Please sign in and change your password immediately.</p>
    <p style="margin:0 0 16px;">As a platform administrator you can manage users, clinics, specialists, and system configuration.</p>
    ${dashboardUrl ? ctaSignIn({ label: "Go to admin dashboard", href: dashboardUrl }) : ""}
  `;

  return transactionalEmail({
    title: "Welcome, administrator",
    subject: "Welcome to Cosmediate — admin account",
    previewText: "Your Cosmediate administrator account is ready.",
    body,
  });
};
