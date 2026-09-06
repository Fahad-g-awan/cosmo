import { DEFAULT_APP_BASE_URL } from "../../mailer.config.mjs";
import { layout } from "../_layout.mjs";

/**
 * @typedef {{
 *   email?: string,
 *   codeParameter?: string,
 *   usernameParameter?: string,
 *   linkParameter?: string,
 *   signInUrl?: string,
 * }} CognitoEmailData
 */

/**
 * @param {CognitoEmailData} data
 */
export const resolveSignInUrl = (data) =>
  data.signInUrl ?? `${DEFAULT_APP_BASE_URL}/auth/signin`;

/**
 * @param {{
 *   title: string,
 *   subject: string,
 *   previewText?: string,
 *   body: string,
 * }} props
 */
export const authEmail = ({ title, subject, previewText, body }) => {
  const { html, text } = layout({ title, body, previewText });
  return { subject, html, text };
};
