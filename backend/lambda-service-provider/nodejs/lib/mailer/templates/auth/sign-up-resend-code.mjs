import { codeBlock, securityNotice } from "../_partials.mjs";
import { authEmail } from "./_auth-utils.mjs";

/**
 * @param {import("./_auth-utils.mjs").CognitoEmailData} data
 */
export const signUpResendCodeEmail = (data) => {
  const code = data.codeParameter ?? "{####}";

  const body = `
    <p style="margin:0 0 16px;">You requested a new verification code for your Cosmediate account:</p>
    ${codeBlock(code)}
    <p style="margin:0;font-size:14px;color:#71788e;">Enter this code to complete your registration.</p>
    ${securityNotice("If you did not request this code, you can safely ignore this email.")}
  `;

  return authEmail({
    title: "Your new verification code",
    subject: "Your Cosmediate verification code",
    previewText: "Here is your new Cosmediate verification code.",
    body,
  });
};
