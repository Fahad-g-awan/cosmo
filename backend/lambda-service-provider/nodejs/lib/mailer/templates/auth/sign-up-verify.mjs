import { codeBlock, securityNotice } from "../_partials.mjs";
import { authEmail } from "./_auth-utils.mjs";

/**
 * @param {import("./_auth-utils.mjs").CognitoEmailData} data
 */
export const signUpVerifyEmail = (data) => {
  const code = data.codeParameter ?? "{####}";

  const body = `
    <p style="margin:0 0 16px;">Thanks for signing up for Cosmediate. Enter this verification code to confirm your email address:</p>
    ${codeBlock(code)}
    <p style="margin:0;font-size:14px;color:#71788e;">This code expires shortly. If you did not create an account, you can ignore this email.</p>
    ${securityNotice("Never share this code with anyone. Cosmediate will never ask for it.")}
  `;

  return authEmail({
    title: "Verify your email",
    subject: "Verify your Cosmediate email",
    previewText: "Your Cosmediate verification code is inside.",
    body,
  });
};
