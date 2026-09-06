import { resolveTemplate } from "./template-registry.mjs";

/**
 * Render an email template without sending.
 *
 * @param {{ type: string, data?: Record<string, unknown> }} params
 * @returns {{ subject: string, html: string, text: string }}
 */
export const renderEmail = ({ type, data = {} }) => {
  if (!type) {
    throw new Error("[mailer] renderEmail requires type");
  }

  const rendered = resolveTemplate(type)(data);
  const subject = rendered.subject?.trim();
  const html = rendered.html?.trim();
  const text = (rendered.text ?? "").trim();

  if (!subject || !html) {
    throw new Error(
      `[mailer] Template "${type}" must return subject and html`,
    );
  }

  return {
    subject,
    html,
    text: text || stripHtmlFallback(html),
  };
};

/**
 * @param {string} html
 */
const stripHtmlFallback = (html) =>
  String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
