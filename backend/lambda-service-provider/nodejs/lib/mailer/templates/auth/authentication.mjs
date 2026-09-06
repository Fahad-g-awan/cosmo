import { codeBlock, securityNotice } from "../_partials.mjs";
import { authEmail } from "./_auth-utils.mjs";

/**
 * @param {import("./_auth-utils.mjs").CognitoEmailData} data
 */
export const authenticationEmail = (data) => {
  const code = data.codeParameter ?? "{####}";

  const body = `
    <p style="margin:0 0 16px;">Use this code to complete your sign-in to Cosmediate:</p>
    ${codeBlock(code)}
    <p style="margin:0;font-size:14px;color:#71788e;">This code expires shortly.</p>
    ${securityNotice("If you did not try to sign in, change your password and contact support.")}
  `;

  return authEmail({
    title: "Your sign-in code",
    subject: "Your Cosmediate sign-in code",
    previewText: "Your Cosmediate sign-in verification code.",
    body,
  });
};
