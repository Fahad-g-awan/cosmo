import { codeBlock, securityNotice } from "../_partials.mjs";
import { authEmail } from "./_auth-utils.mjs";

/**
 * @param {import("./_auth-utils.mjs").CognitoEmailData} data
 */
export const verifyUserAttributeEmail = (data) => {
  const code = data.codeParameter ?? "{####}";

  const body = `
    <p style="margin:0 0 16px;">Confirm your account update with this verification code:</p>
    ${codeBlock(code)}
    <p style="margin:0;font-size:14px;color:#71788e;">This code is required to verify the change to your account.</p>
    ${securityNotice("If you did not make this change, contact support immediately.")}
  `;

  return authEmail({
    title: "Verify your account update",
    subject: "Verify your Cosmediate account update",
    previewText: "Verify your Cosmediate account update.",
    body,
  });
};
