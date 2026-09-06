import { escapeHtml } from "../_layout.mjs";

/**
 * Plain diagnostic layout for dev/runtime alerts — no marketing chrome.
 *
 * @param {{ title: string, body: string }} props
 */
export const devLayout = ({ title, body }) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:24px;font-family:Consolas,Monaco,'Courier New',monospace;font-size:13px;line-height:1.5;color:#1a1a1a;background:#f5f5f5;">
  <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #ddd;border-radius:4px;padding:20px;">
    <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#b42318;">[Cosmediate Dev] ${escapeHtml(title)}</p>
    ${body}
  </div>
</body>
</html>`;

  const text = `${title}\n\n${stripDevHtml(body)}`;

  return { html, text };
};

/**
 * @param {string} html
 */
const stripDevHtml = (html) =>
  String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, ": ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
