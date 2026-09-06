import { codeBlock, securityNotice } from "../_partials.mjs";
import { authEmail } from "./_auth-utils.mjs";

/**
 * @param {import("./_auth-utils.mjs").CognitoEmailData} data
 */
export const forgotPasswordResendCodeEmail = (data) => {
  const code = data.codeParameter ?? "{####}";

  const body = `
    <p style="margin:0 0 16px;">Here is a new password reset code for your Cosmediate account:</p>
    ${codeBlock(code)}
    <p style="margin:0;font-size:14px;color:#71788e;">This replaces any previous reset code you may have received.</p>
    ${securityNotice("If you did not request a password reset, ignore this email.")}
  `;

  return authEmail({
    title: "Your new reset code",
    subject: "Your new Cosmediate password reset code",
    previewText: "Your new Cosmediate password reset code.",
    body,
  });
};
