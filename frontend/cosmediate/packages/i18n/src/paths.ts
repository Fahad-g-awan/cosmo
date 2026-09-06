/**
 * Cross-app shortcut paths used in header/footer chrome.
 * Resolved to sibling apps via proxy middleware and `resolveFooterShortcutHref`.
 */
export const CHROME_PATHS = {
  treatments: "/home/treatments",
  clinics: "/home/clinics",
  specialists: "/home/specialists",
  blog: "/blog",
  privacyPolicy: "/home/privacy-policy",
  termsAndConditions: "/home/terms-and-conditions",
  partnersClinics: "/home/partners/clinics",
  registerDoctor: "/home/partners/register/doctor",
  registerClinic: "/home/partners/register/clinic",
  contact: "/home/contact",
  about: "/home/about",
  vacancies: "/home/vacancies",
} as const;

export type HeaderNavKey = "treatments" | "clinics" | "specialists";

export const HEADER_NAV_ITEMS: ReadonlyArray<{
  key: HeaderNavKey;
  url: string;
}> = [
  { key: "treatments", url: CHROME_PATHS.treatments },
  { key: "clinics", url: CHROME_PATHS.clinics },
  { key: "specialists", url: CHROME_PATHS.specialists },
];
