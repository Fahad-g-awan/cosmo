import type { FooterMessages, HeaderMessages, NavMessages } from "../types";
import { CHROME_PATHS } from "../paths";

export const enHeader: HeaderMessages = {
  signIn: "Sign In",
  signUp: "Sign up",
  signOut: "Sign Out",
  dontHaveAccount: "Don't have an account?",
  alreadyHaveAccount: "Already have an account?",
};

export const enFooter: FooterMessages = {
  knowledge: "Knowledge",
  partners: "Partners",
  aboutSection: "About",
  privacyPolicy: "Privacy policy",
  termsAndConditions: "Terms & conditions",
  informationForClinics: "Information for clinics",
  registerDoctor: "Register a doctor",
  registerClinic: "Register a clinic",
  vacancies: "Vacancies",
  aboutUs: "About Us",
};

export interface FooterLinkItem {
  label: string;
  url: string;
}

export interface FooterLinks {
  treatments: FooterLinkItem[];
  knowledge: FooterLinkItem[];
  partners: FooterLinkItem[];
  about: FooterLinkItem[];
}

/** Treatment names kept as proper nouns (not translated). */
const FOOTER_TREATMENT_NAMES = [
  "Mommy Makeover",
  "Juvederm",
  "Vampire Facial",
  "Rhinoplasty",
  "Rhinoplasty Revision",
  "Breast Reduction",
  "Hair Transplantation",
  "Liposuction",
  "HIFU Treatment",
  "Brazilian Butt Lift",
  "Tummy Tuck",
  "Labiaplasty",
  "Botox",
  "Fillers",
  "Breast Augmentation",
] as const;

export function buildFooterLinks(
  nav: NavMessages,
  footer: FooterMessages,
): FooterLinks {
  return {
    treatments: FOOTER_TREATMENT_NAMES.map((label) => ({
      label,
      url: CHROME_PATHS.treatments,
    })),
    knowledge: [
      { label: nav.treatments, url: CHROME_PATHS.treatments },
      { label: nav.clinics, url: CHROME_PATHS.clinics },
      { label: nav.specialists, url: CHROME_PATHS.specialists },
      { label: nav.blog, url: CHROME_PATHS.blog },
      { label: footer.privacyPolicy, url: CHROME_PATHS.privacyPolicy },
      {
        label: footer.termsAndConditions,
        url: CHROME_PATHS.termsAndConditions,
      },
    ],
    partners: [
      {
        label: footer.informationForClinics,
        url: CHROME_PATHS.partnersClinics,
      },
      { label: footer.registerDoctor, url: CHROME_PATHS.registerDoctor },
      { label: footer.registerClinic, url: CHROME_PATHS.registerClinic },
    ],
    about: [
      { label: nav.contact, url: CHROME_PATHS.contact },
      { label: footer.aboutUs, url: CHROME_PATHS.about },
      { label: footer.vacancies, url: CHROME_PATHS.vacancies },
    ],
  };
}
