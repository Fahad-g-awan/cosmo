import { EMAIL_THEME as t } from "./_theme.mjs";
import { textLink } from "./_partials.mjs";

/**
 * Wrap email body in a branded, table-based layout (Outlook-safe).
 *
 * @param {{
 *   title: string,
 *   body: string,
 *   previewText?: string,
 *   contactUrl?: string,
 * }} props
 * @returns {{ html: string, text: string }}
 */
export const layout = ({ title, body, previewText = "", contactUrl }) => {
  const supportUrl = contactUrl ?? "https://www.cosmediate.nl/contact";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
  <style type="text/css">
    a.cm-primary-btn,
    a.cm-primary-btn:link,
    a.cm-primary-btn:visited,
    a.cm-primary-btn:hover,
    a.cm-primary-btn:active {
      color: #ffffff !important;
      text-decoration: none !important;
    }
    a.cm-primary-btn:hover {
      background-color: ${t.primaryAccentDark} !important;
    }
    .cm-primary-btn-cell:hover {
      background-color: ${t.primaryAccentDark} !important;
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f6ff;font-family:${t.fontFamily};color:${t.foreground};line-height:1.6;">
  ${
    previewText
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:#f3f6ff;">${escapeHtml(previewText)}</div>`
      : ""
  }
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f6ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:${t.background};border:1px solid ${t.border};border-radius:${t.radius};overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;background:linear-gradient(180deg, ${t.secondary} 0%, ${t.background} 100%);border-bottom:1px solid ${t.border};">
              <p style="margin:0;font-size:22px;font-weight:700;color:${t.primary};letter-spacing:-0.02em;">Cosmediate</p>
              <h1 style="margin:12px 0 0;font-size:20px;font-weight:600;color:${t.foreground};">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;font-size:15px;color:${t.foreground};">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background-color:${t.secondary};border-top:1px solid ${t.border};text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:${t.mutedForeground};">Need help?</p>
              <p style="margin:0;font-size:13px;color:${t.mutedForeground};">
                ${textLink({ text: "Contact support", href: supportUrl })}
              </p>
              <p style="margin:16px 0 0;font-size:12px;color:${t.mutedForeground};">
                &copy; Cosmediate. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = stripHtmlToText(body);
  const plainText = [title, text, `Support: ${supportUrl}`]
    .filter((part) => part.length > 0)
    .join("\n\n");

  return { html, text: plainText };
};

/**
 * @param {string} value
 */
export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * @param {string} html
 */
const stripHtmlToText = (html) =>
  String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
