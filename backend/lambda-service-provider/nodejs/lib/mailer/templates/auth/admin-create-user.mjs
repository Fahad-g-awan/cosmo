import {
  infoBox,
  primaryButton,
  securityNotice,
} from "../_partials.mjs";
import { authEmail, resolveSignInUrl } from "./_auth-utils.mjs";

/**
 * Admin-created user — credentials only (welcome is a separate SES email).
 * Cognito substitutes {username} and {####} after this Lambda returns.
 *
 * @param {import("./_auth-utils.mjs").CognitoEmailData} data
 */
export const adminCreateUserEmail = (data) => {
  const username = data.usernameParameter ?? "{username}";
  const password = data.codeParameter ?? "{####}";
  const signInUrl = resolveSignInUrl(data);

  const body = `
    <p style="margin:0 0 16px;">Your Cosmediate account has been created. Use the credentials below to sign in.</p>
    ${infoBox(`
      <p style="margin:0 0 8px;font-weight:600;">Sign-in details</p>
      <p style="margin:0 0 6px;">Username: <strong>${username}</strong></p>
      <p style="margin:0;">Temporary password: <strong>${password}</strong></p>
    `)}
    ${securityNotice(
      "Change your temporary password immediately after your first sign-in.",
    )}
    ${primaryButton({ label: "Sign in to Cosmediate", href: signInUrl })}
  `;

  return authEmail({
    title: "Your sign-in details",
    subject: "Your Cosmediate sign-in details",
    previewText: "Your Cosmediate account credentials are ready.",
    body,
  });
};
