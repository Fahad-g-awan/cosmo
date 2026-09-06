import { codeBlock, securityNotice } from "../_partials.mjs";
import { authEmail } from "./_auth-utils.mjs";

/**
 * @param {import("./_auth-utils.mjs").CognitoEmailData} data
 */
export const forgotPasswordEmail = (data) => {
  const code = data.codeParameter ?? "{####}";

  const body = `
    <p style="margin:0 0 16px;">We received a request to reset your Cosmediate password. Use this code to continue:</p>
    ${codeBlock(code)}
    <p style="margin:0;font-size:14px;color:#71788e;">If you did not request a password reset, ignore this email — your password will stay the same.</p>
    ${securityNotice("Never share this code with anyone.")}
  `;

  return authEmail({
    title: "Reset your password",
    subject: "Reset your Cosmediate password",
    previewText: "Your Cosmediate password reset code.",
    body,
  });
};
