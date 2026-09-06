import { transactionalEmail } from "../transactional/_transactional-utils.mjs";

/**
 * @param {{
 *   subject: string,
 *   title: string,
 *   previewText: string,
 *   greeting?: string,
 *   paragraphs: string[],
 * }} props
 */
export const userNotificationEmail = ({
  subject,
  title,
  previewText,
  greeting = "Hi there,",
  paragraphs,
}) => {
  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    ${paragraphs.map((p) => `<p style="margin:0 0 16px;">${p}</p>`).join("")}
  `;

  return transactionalEmail({ subject, title, previewText, body });
};
