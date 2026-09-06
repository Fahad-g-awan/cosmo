import { primaryButton, securityNotice } from "../_partials.mjs";
import { transactionalEmail } from "./_transactional-utils.mjs";

/**
 * @param {{
 *   name?: string,
 *   email?: string,
 *   providerLabel?: string,
 *   signInUrl?: string,
 * }} data
 */
export const socialAccountLinkedEmail = (data) => {
  const name = data.name || data.email || "there";
  const provider = data.providerLabel || "your social account";
  const signInUrl = data.signInUrl ?? "";

  const body = `
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 16px;"><strong>${provider}</strong> is now linked to your Cosmediate account. You can sign in with ${provider} or your email and password.</p>
    ${signInUrl ? primaryButton({ label: "Sign in", href: signInUrl }) : ""}
    ${securityNotice(
      "If you did not link this account, contact support immediately.",
    )}
  `;

  return transactionalEmail({
    title: "Account linked",
    subject: `${provider} linked to your Cosmediate account`,
    previewText: `${provider} was linked to your Cosmediate account.`,
    body,
  });
};
