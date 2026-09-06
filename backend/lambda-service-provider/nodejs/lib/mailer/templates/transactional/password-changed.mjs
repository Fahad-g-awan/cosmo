import { primaryButton, securityNotice } from "../_partials.mjs";
import { transactionalEmail } from "./_transactional-utils.mjs";

/**
 * @param {{
 *   name?: string,
 *   email?: string,
 *   changedAt?: string,
 *   signInUrl?: string,
 * }} data
 */
export const passwordChangedEmail = (data) => {
  const name = data.name || data.email || "there";
  const signInUrl = data.signInUrl ?? "";
  const when = data.changedAt
    ? new Date(data.changedAt).toUTCString()
    : "just now";

  const body = `
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 16px;">This confirms your Cosmediate password was changed successfully on <strong>${when}</strong>.</p>
    ${signInUrl ? primaryButton({ label: "Sign in", href: signInUrl }) : ""}
    ${securityNotice(
      "If you did not make this change, reset your password immediately and contact support.",
    )}
  `;

  return transactionalEmail({
    title: "Password updated",
    subject: "Your Cosmediate password was changed",
    previewText: "Your Cosmediate password was changed successfully.",
    body,
  });
};
