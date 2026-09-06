import { formatClinicNames } from "../../mail-urls.mjs";
import { primaryButton } from "../_partials.mjs";
import { layout } from "../_layout.mjs";

/**
 * @param {{
 *   title: string,
 *   subject: string,
 *   previewText?: string,
 *   body: string,
 * }} props
 */
export const transactionalEmail = ({ title, subject, previewText, body }) => {
  const { html, text } = layout({ title, body, previewText });
  return { subject, html, text };
};

/**
 * @param {string[]} clinicNames
 */
export const clinicContextBlock = (clinicNames = []) => {
  const formatted = formatClinicNames(clinicNames);
  if (!formatted) return "";

  const label = clinicNames.length > 1 ? "your clinics" : "your clinic";
  return `<p style="margin:0 0 16px;">You are set up on Cosmediate under ${label}: <strong>${formatted}</strong>.</p>`;
};

/**
 * @param {{ label?: string, href: string }} props
 */
export const ctaSignIn = ({ label = "Sign in to Cosmediate", href }) =>
  primaryButton({ label, href });
