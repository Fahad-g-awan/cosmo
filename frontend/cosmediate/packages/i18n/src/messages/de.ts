import type {
  CommonMessages,
  NavMessages,
  SeoMessages,
  UiMessages,
} from "../types";
import { deFooter, deHeader } from "../chrome/de";
import { deMarketing } from "../marketing/de";
import { deProfile } from "../profile/de";
import { deBrowse } from "../browse/de";
import { deForms } from "../forms/de";
import { deBlog } from "../blog/de";
import { deAuth } from "../auth/de";

export const deNav: NavMessages = {
  treatments: "Behandlungen",
  clinics: "Kliniken",
  specialists: "Spezialisten",
  blog: "Blog",
  about: "Über uns",
  contact: "Kontakt",
  home: "Startseite",
  browseCosmediate: "Cosmediate durchsuchen",
  allClinics: "Alle Kliniken",
  allSpecialists: "Alle Spezialisten",
  allTreatments: "Alle Behandlungen",
};

export const deCommon: CommonMessages = {
  tryAgain: "Erneut versuchen",
  pleaseTryAgain: "Bitte versuchen Sie es erneut",
  pleaseTryAgainLater: "Bitte versuchen Sie es später erneut",
  dataNotFound: "Daten nicht gefunden",
  loading: "Wird geladen...",
};

export const deUiMessages: UiMessages = {
  common: deCommon,
  nav: deNav,
  header: deHeader,
  footer: deFooter,
  marketing: deMarketing,
  forms: deForms,
  browse: deBrowse,
  profile: deProfile,
  blog: deBlog,
  auth: deAuth,
};

export const deSeoMessages: SeoMessages = {
  siteName: "Cosmediate",
  web: {
    defaultTitle: "Cosmediate",
    defaultDescription:
      "Finden, vergleichen und buchen Sie vertrauenswürdige Kliniken und Spezialisten für kosmetische Behandlungen, plastische Chirurgie, Dermatologie, ästhetische Zahnmedizin und Longevity-Behandlungen",
  },
  blog: {
    defaultTitle: "Cosmediate Blog",
    defaultDescription:
      "Fachartikel zu kosmetischer Versorgung, plastischer Chirurgie, Dermatologie, ästhetischer Zahnmedizin und Longevity-Behandlungen.",
    collectionName: "Cosmediate Blog",
    readArticleBy: (title, author) =>
      `Lesen Sie ${title} von ${author} im Cosmediate-Blog.`,
  },
  notFound: {
    clinic: "Klinik nicht gefunden",
    specialist: "Spezialist nicht gefunden",
    treatment: "Behandlung nicht gefunden",
    article: "Artikel nicht gefunden",
  },
  entity: {
    specialistsCount: (count) => `${count} Spezialisten`,
    treatmentsCount: (count) => `${count} Behandlungen`,
    reviewsCount: (count) => `${count} Bewertungen`,
    reviewsWithRating: (count, rating) => `${count} Bewertungen (★ ${rating})`,
    viewClinicDetails:
      "Preise, Qualifikationen, Behandlungen und FAQs ansehen.",
    viewSpecialistDetails:
      "Behandlungen, Preise, Qualifikationen und FAQs ansehen.",
    findTreatmentProviders:
      "Finden Sie Kliniken und Spezialisten, die diese Behandlung anbieten.",
    categoryLabel: (name) => `Kategorie: ${name}.`,
  },
  clinic: {
    bookInCity: (name, city) => `Buchen Sie bei ${name} in ${city}.`,
    bookOnPlatform: (name) => `Buchen Sie bei ${name} auf Cosmediate.`,
  },
  specialist: {
    bookConsultation: (name, city) =>
      city
        ? `Buchen Sie eine Beratung mit ${name} in ${city} auf Cosmediate.`
        : `Buchen Sie eine Beratung mit ${name} auf Cosmediate.`,
  },
  treatment: {
    learnAbout: (name) => `Erfahren Sie mehr über ${name} auf Cosmediate.`,
  },
  listings: {
    clinics: {
      title: "Kliniken finden",
      description:
        "Durchsuchen Sie vertrauenswürdige Kliniken für kosmetische Behandlungen, plastische Chirurgie, Dermatologie, ästhetische Zahnmedizin und Longevity-Behandlungen.",
      label: "Kliniken",
    },
    specialists: {
      title: "Spezialisten finden",
      description:
        "Finden Sie Spezialisten für kosmetische Behandlungen, plastische Chirurgie, Dermatologie, ästhetische Zahnmedizin und Longevity-Behandlungen.",
      label: "Spezialisten",
    },
    treatments: {
      title: "Behandlungen entdecken",
      description:
        "Entdecken Sie kosmetische Behandlungen, plastische Chirurgie, Dermatologie, ästhetische Zahnmedizin und Longevity-Behandlungen auf Cosmediate.",
      label: "Behandlungen",
    },
  },
  marketing: {
    home: {
      title: "Cosmediate",
      description:
        "Finden Sie geprüfte Kliniken, Spezialisten und Behandlungen für kosmetische Versorgung, plastische Chirurgie, Dermatologie, ästhetische Zahnmedizin und Longevity. Entdecken Sie Behandlungen, vergleichen Sie Kliniken und buchen Sie Ihren Termin.",
    },
    about: {
      title: "Über uns",
      description:
        "Erfahren Sie mehr über Cosmediate, die Plattform, die Patienten mit geprüften Kliniken und Spezialisten in kosmetischer Versorgung, plastischer Chirurgie, Dermatologie, ästhetischer Zahnmedizin und Longevity-Behandlungen verbindet.",
    },
    contact: {
      title: "Kontakt",
      description:
        "Kontaktieren Sie das Cosmediate-Team. Fragen zu Kliniken, Spezialisten, Behandlungen, Partnerschaften oder der Nutzung der Plattform.",
    },
    vacancies: {
      title: "Stellenangebote",
      description:
        "Entdecken Sie Karrieremöglichkeiten bei Cosmediate und werden Sie Teil unseres Teams, das die Plattform für kosmetische Versorgung, plastische Chirurgie, Dermatologie, ästhetische Zahnmedizin und Longevity-Behandlungen aufbaut.",
    },
    partnersClinics: {
      title: "Informationen für Kliniken",
      description:
        "Werden Sie Partner von Cosmediate, um Ihre Klinik zu vergrößern, Ihr Profil zu verwalten und Patienten zu erreichen, die kosmetische Versorgung, plastische Chirurgie, Dermatologie, ästhetische Zahnmedizin und Longevity-Behandlungen suchen.",
    },
    registerClinic: {
      title: "Klinik registrieren",
      description:
        "Registrieren Sie Ihre Klinik auf Cosmediate und erreichen Sie Patienten, die kosmetische Versorgung, plastische Chirurgie, Dermatologie, ästhetische Zahnmedizin und Longevity-Behandlungen suchen.",
    },
    registerDoctor: {
      title: "Als Spezialist registrieren",
      description:
        "Registrieren Sie sich als Spezialist auf Cosmediate. Präsentieren Sie Ihre Expertise und verbinden Sie sich mit Patienten, die vertrauenswürdige ästhetische und medizinisch-ästhetische Versorgung suchen.",
    },
    privacyPolicy: {
      title: "Datenschutzerklärung",
      description:
        "Lesen Sie die Datenschutzerklärung von Cosmediate und wie wir mit Ihren Daten umgehen.",
    },
    termsAndConditions: {
      title: "Allgemeine Geschäftsbedingungen",
      description:
        "Lesen Sie die Allgemeinen Geschäftsbedingungen von Cosmediate für die Nutzung unserer Plattform.",
    },
  },
  nav: deNav,
  profileSeo: {
    clinicSummary: (name) => `Zusammenfassung von ${name}`,
    specialistSummary: (name) => `Zusammenfassung von ${name}`,
    treatmentSummary: (name) => `Zusammenfassung von ${name}`,
    specialistsAtClinic: "Spezialisten in dieser Klinik",
    treatmentsAtClinic: "Behandlungen in dieser Klinik",
    clinicsForSpecialist: "Kliniken für diesen Spezialisten",
    treatmentsBySpecialist: "Behandlungen von diesem Spezialisten",
    clinicsOfferingTreatment: "Kliniken, die diese Behandlung anbieten",
    specialistsOfferingTreatment: "Spezialisten, die diese Behandlung anbieten",
    specialistFallback: "Spezialist",
  },
};
