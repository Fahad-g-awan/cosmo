export type MessageLocale = "en" | "nl" | "de" | "fr" | "it" | "el";

import type { MarketingMessages } from "./marketing/types";
import type { FormMessages } from "./forms/types";
import type { BrowseMessages } from "./browse/types";
import type { ProfileMessages } from "./profile/types";
import type { BlogMessages } from "./blog/types";
import type { AuthMessages } from "./auth/types";

export type { AuthMessages, AuthProcessingErrorCode } from "./auth/types";
export type { FormMessages, FormValidationMessages } from "./forms/types";
export type { BrowseMessages, BrowseMonthLabels } from "./browse/types";
export type { MarketingMessages } from "./marketing/types";
export type { ProfileMessages } from "./profile/types";
export type { BlogMessages } from "./blog/types";

/** @deprecated Use `MessageLocale` — kept for SEO consumers during migration. */
export type SeoMessageLocale = MessageLocale;

export const MESSAGE_LOCALES = [
  "en",
  "nl",
  "de",
  "fr",
  "it",
  "el",
] as const satisfies readonly MessageLocale[];

export interface NavMessages {
  treatments: string;
  clinics: string;
  specialists: string;
  blog: string;
  about: string;
  contact: string;
  home: string;
  browseCosmediate: string;
  allClinics: string;
  allSpecialists: string;
  allTreatments: string;
}

export interface CommonMessages {
  tryAgain: string;
  pleaseTryAgain: string;
  pleaseTryAgainLater: string;
  dataNotFound: string;
  loading: string;
}

export interface HeaderMessages {
  signIn: string;
  signUp: string;
  signOut: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
}

export interface FooterMessages {
  knowledge: string;
  partners: string;
  aboutSection: string;
  privacyPolicy: string;
  termsAndConditions: string;
  informationForClinics: string;
  registerDoctor: string;
  registerClinic: string;
  vacancies: string;
  aboutUs: string;
}

export interface UiMessages {
  common: CommonMessages;
  nav: NavMessages;
  header: HeaderMessages;
  footer: FooterMessages;
  marketing: MarketingMessages;
  forms: FormMessages;
  browse: BrowseMessages;
  profile: ProfileMessages;
  blog: BlogMessages;
  auth: AuthMessages;
}

export type UiNamespace = keyof UiMessages;

export interface MarketingPageMessages {
  title: string;
  description: string;
}

export interface ListingPageMessages {
  title: string;
  description: string;
  label: string;
}

export interface SeoMessages {
  siteName: string;
  web: {
    defaultTitle: string;
    defaultDescription: string;
  };
  blog: {
    defaultTitle: string;
    defaultDescription: string;
    collectionName: string;
    readArticleBy: (title: string, author: string) => string;
  };
  notFound: {
    clinic: string;
    specialist: string;
    treatment: string;
    article: string;
  };
  entity: {
    specialistsCount: (count: number) => string;
    treatmentsCount: (count: number) => string;
    reviewsCount: (count: number) => string;
    reviewsWithRating: (count: number, rating: string) => string;
    viewClinicDetails: string;
    viewSpecialistDetails: string;
    findTreatmentProviders: string;
    categoryLabel: (name: string) => string;
  };
  clinic: {
    bookInCity: (name: string, city: string) => string;
    bookOnPlatform: (name: string) => string;
  };
  specialist: {
    bookConsultation: (name: string, city?: string) => string;
  };
  treatment: {
    learnAbout: (name: string) => string;
  };
  listings: {
    clinics: ListingPageMessages;
    specialists: ListingPageMessages;
    treatments: ListingPageMessages;
  };
  marketing: {
    home: MarketingPageMessages;
    about: MarketingPageMessages;
    contact: MarketingPageMessages;
    vacancies: MarketingPageMessages;
    partnersClinics: MarketingPageMessages;
    registerClinic: MarketingPageMessages;
    registerDoctor: MarketingPageMessages;
    privacyPolicy: MarketingPageMessages;
    termsAndConditions: MarketingPageMessages;
  };
  nav: NavMessages;
  profileSeo: {
    clinicSummary: (name: string) => string;
    specialistSummary: (name: string) => string;
    treatmentSummary: (name: string) => string;
    specialistsAtClinic: string;
    treatmentsAtClinic: string;
    clinicsForSpecialist: string;
    treatmentsBySpecialist: string;
    clinicsOfferingTreatment: string;
    specialistsOfferingTreatment: string;
    specialistFallback: string;
  };
}
