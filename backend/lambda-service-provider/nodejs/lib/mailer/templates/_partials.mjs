import { EMAIL_THEME as t } from "./_theme.mjs";

/**
 * @param {{ label: string, href: string }} props
 */
export const primaryButton = ({ label, href }) => `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
    <tr>
      <td class="cm-primary-btn-cell" style="border-radius: ${t.radius}; background-color: ${t.primary};">
        <a class="cm-primary-btn" href="${href}" target="_blank" style="display: inline-block; padding: 12px 24px; font-family: ${t.fontFamily}; font-size: 15px; font-weight: 600; color: #ffffff !important; text-decoration: none !important; border-radius: ${t.radius}; background-color: ${t.primary};">
          ${label}
        </a>
      </td>
    </tr>
  </table>
`;

/**
 * @param {string} innerHtml
 */
export const infoBox = (innerHtml) => `
  <div style="background-color: ${t.secondary}; border: 1px solid ${t.border}; border-radius: ${t.radius}; padding: 16px 20px; margin: 20px 0;">
    ${innerHtml}
  </div>
`;

/**
 * @param {string} code — may be a Cognito placeholder like {####}
 */
export const codeBlock = (code) => `
  <p style="margin: 16px 0; font-family: ${t.fontFamily}; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: ${t.primary}; text-align: center;">
    ${code}
  </p>
`;

/**
 * @param {string} message
 */
export const securityNotice = (message) => `
  <p style="margin: 20px 0 0; padding: 14px 16px; background-color: ${t.secondary}; border-left: 4px solid ${t.destructive}; border-radius: 4px; font-size: 14px; color: ${t.mutedForeground}; line-height: 1.5;">
    ${message}
  </p>
`;

/**
 * @param {{ text: string, href: string }} props
 */
export const textLink = ({ text, href }) =>
  `<a href="${href}" style="color: ${t.primary}; text-decoration: underline;">${text}</a>`;
