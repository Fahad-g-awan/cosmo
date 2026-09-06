import { codeBlock, securityNotice } from "../_partials.mjs";
import { authEmail } from "./_auth-utils.mjs";

/**
 * @param {import("./_auth-utils.mjs").CognitoEmailData} data
 */
export const updateUserAttributeEmail = (data) => {
  const code = data.codeParameter ?? "{####}";

  const body = `
    <p style="margin:0 0 16px;">You are updating information on your Cosmediate account. Confirm with this code:</p>
    ${codeBlock(code)}
    <p style="margin:0;font-size:14px;color:#71788e;">If this wasn't you, secure your account and contact support.</p>
    ${securityNotice("Never share this code with anyone.")}
  `;

  return authEmail({
    title: "Confirm account update",
    subject: "Confirm your Cosmediate account update",
    previewText: "Confirm your Cosmediate account update.",
    body,
  });
};
