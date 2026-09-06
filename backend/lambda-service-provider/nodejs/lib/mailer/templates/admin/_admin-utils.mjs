import { escapeHtml, layout } from "../_layout.mjs";

/**
 * @param {{
 *   subject: string,
 *   title: string,
 *   previewText?: string,
 *   summary: string,
 *   fields?: Record<string, unknown>,
 * }} props
 */
export const adminEmail = ({ subject, title, previewText, summary, fields = {} }) => {
  const fieldRows = Object.entries(fields)
    .filter(([, value]) => value != null && value !== "")
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 8px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</p>`,
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;">${escapeHtml(summary)}</p>
    ${fieldRows}
    <p style="margin:16px 0 0;font-size:13px;color:#64748b;">This is an automated platform activity notice for Cosmediate administrators.</p>
  `;

  const { html, text } = layout({ title, body, previewText });
  return { subject, html, text };
};
