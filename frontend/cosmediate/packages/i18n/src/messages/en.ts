import type {
  CommonMessages,
  NavMessages,
  SeoMessages,
  UiMessages,
} from "../types";
import { enFooter, enHeader } from "../chrome/en";
import { enMarketing } from "../marketing/en";
import { enProfile } from "../profile/en";
import { enBrowse } from "../browse/en";
import { enForms } from "../forms/en";
import { enBlog } from "../blog/en";
import { enAuth } from "../auth/en";

export const enNav: NavMessages = {
  treatments: "Treatments",
  clinics: "Clinics",
  specialists: "Specialists",
  blog: "Blog",
  about: "About",
  contact: "Contact",
  home: "Home",
  browseCosmediate: "Browse Cosmediate",
  allClinics: "All clinics",
  allSpecialists: "All specialists",
  allTreatments: "All treatments",
};

export const enCommon: CommonMessages = {
  tryAgain: "Try again",
  pleaseTryAgain: "Please try again",
  pleaseTryAgainLater: "Please try again later",
  dataNotFound: "Data not found",
  loading: "Loading...",
};

export const enUiMessages: UiMessages = {
  common: enCommon,
  nav: enNav,
  header: enHeader,
  footer: enFooter,
  marketing: enMarketing,
  forms: enForms,
  browse: enBrowse,
  profile: enProfile,
  blog: enBlog,
  auth: enAuth,
};

export const enSeoMessages: SeoMessages = {
  siteName: "Cosmediate",
  web: {
    defaultTitle: "Cosmediate",
    defaultDescription:
      "Find, compare, and book trusted clinics and specialists for cosmetic care, plastic surgery, dermatology, aesthetic dental care, and longevity treatments",
  },
  blog: {
    defaultTitle: "Cosmediate Blog",
    defaultDescription:
      "Expert articles on cosmetic care, plastic surgery, dermatology, aesthetic dental care and longevity treatments.",
    collectionName: "Cosmediate Blog",
    readArticleBy: (title, author) =>
      `Read ${title} by ${author} on the Cosmediate blog.`,
  },
  notFound: {
    clinic: "Clinic Not Found",
    specialist: "Specialist Not Found",
    treatment: "Treatment Not Found",
    article: "Article Not Found",
  },
  entity: {
    specialistsCount: (count) => `${count} specialists`,
    treatmentsCount: (count) => `${count} treatments`,
    reviewsCount: (count) => `${count} reviews`,
    reviewsWithRating: (count, rating) => `${count} reviews (★ ${rating})`,
    viewClinicDetails: "View prices, credentials, treatments, and FAQs.",
    viewSpecialistDetails: "View treatments, prices, credentials, and FAQs.",
    findTreatmentProviders:
      "Find clinics and specialists offering this treatment.",
    categoryLabel: (name) => `Category: ${name}.`,
  },
  clinic: {
    bookInCity: (name, city) => `Book at ${name} in ${city}.`,
    bookOnPlatform: (name) => `Book at ${name} on Cosmediate.`,
  },
  specialist: {
    bookConsultation: (name, city) =>
      city
        ? `Book a consultation with ${name} in ${city} on Cosmediate.`
        : `Book a consultation with ${name} on Cosmediate.`,
  },
  treatment: {
    learnAbout: (name) => `Learn about ${name} on Cosmediate.`,
  },
  listings: {
    clinics: {
      title: "Find Clinics",
      description:
        "Browse trusted clinics for cosmetic care, plastic surgery, dermatology, aesthetic dental care, and longevity treatments.",
      label: "Clinics",
    },
    specialists: {
      title: "Find Specialists",
      description:
        "Find specialists in cosmetic care, plastic surgery, dermatology, aesthetic dental care, and longevity treatments.",
      label: "Specialists",
    },
    treatments: {
      title: "Browse Treatments",
      description:
        "Explore cosmetic care, plastic surgery, dermatology, aesthetic dental care, and longevity treatments on Cosmediate.",
      label: "Treatments",
    },
  },
  marketing: {
    home: {
      title: "Cosmediate",
      description:
        "Find verified clinics, specialists, and treatments for cosmetic care, plastic surgery, dermatology, aesthetic dental care, and longevity. Explore treatments, compare clinics, and book your appointment.",
    },
    about: {
      title: "About Us",
      description:
        "Learn about Cosmediate, the platform connecting patients with verified clinics and specialists in cosmetic care, plastic surgery, dermatology, aesthetic dental care, and longevity treatments.",
    },
    contact: {
      title: "Contact Us",
      description:
        "Get in touch with the Cosmediate team. Questions about clinics, specialists, treatments, partnerships, or using the platform.",
    },
    vacancies: {
      title: "Vacancies",
      description:
        "Explore career opportunities at Cosmediate and join our team building the platform for cosmetic care, plastic surgery, dermatology, aesthetic dental care, and longevity treatments.",
    },
    partnersClinics: {
      title: "Information for Clinics",
      description:
        "Partner with Cosmediate to grow your clinic, manage your profile, and reach patients searching for cosmetic care, plastic surgery, dermatology, aesthetic dental care, and longevity treatments.",
    },
    registerClinic: {
      title: "Register Your Clinic",
      description:
        "Register your clinic on Cosmediate and reach patients searching for cosmetic care, plastic surgery, dermatology, aesthetic dental care, and longevity treatments.",
    },
    registerDoctor: {
      title: "Register as a Specialist",
      description:
        "Register as a specialist on Cosmediate. Showcase your expertise and connect with patients looking for trusted aesthetic and medical-aesthetic care.",
    },
    privacyPolicy: {
      title: "Privacy Policy",
      description:
        "Read the Cosmediate privacy policy and how we handle your data.",
    },
    termsAndConditions: {
      title: "Terms and Conditions",
      description:
        "Read the Cosmediate terms and conditions for using our platform.",
    },
  },
  nav: enNav,
  profileSeo: {
    clinicSummary: (name) => `${name} summary`,
    specialistSummary: (name) => `${name} summary`,
    treatmentSummary: (name) => `${name} summary`,
    specialistsAtClinic: "Specialists at this clinic",
    treatmentsAtClinic: "Treatments at this clinic",
    clinicsForSpecialist: "Clinics for this specialist",
    treatmentsBySpecialist: "Treatments by this specialist",
    clinicsOfferingTreatment: "Clinics offering this treatment",
    specialistsOfferingTreatment: "Specialists offering this treatment",
    specialistFallback: "Specialist",
  },
};
