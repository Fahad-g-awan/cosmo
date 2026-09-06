import type {
  CommonMessages,
  NavMessages,
  SeoMessages,
  UiMessages,
} from "../types";
import { nlFooter, nlHeader } from "../chrome/nl";
import { nlMarketing } from "../marketing/nl";
import { nlProfile } from "../profile/nl";
import { nlBrowse } from "../browse/nl";
import { nlForms } from "../forms/nl";
import { nlBlog } from "../blog/nl";
import { nlAuth } from "../auth/nl";

export const nlNav: NavMessages = {
  treatments: "Behandelingen",
  clinics: "Klinieken",
  specialists: "Specialisten",
  blog: "Blog",
  about: "Over ons",
  contact: "Contact",
  home: "Home",
  browseCosmediate: "Bladeren op Cosmediate",
  allClinics: "Alle klinieken",
  allSpecialists: "Alle specialisten",
  allTreatments: "Alle behandelingen",
};

export const nlCommon: CommonMessages = {
  tryAgain: "Probeer opnieuw",
  pleaseTryAgain: "Probeer het opnieuw",
  pleaseTryAgainLater: "Probeer het later opnieuw",
  dataNotFound: "Gegevens niet gevonden",
  loading: "Laden...",
};

export const nlUiMessages: UiMessages = {
  common: nlCommon,
  nav: nlNav,
  header: nlHeader,
  footer: nlFooter,
  marketing: nlMarketing,
  forms: nlForms,
  browse: nlBrowse,
  profile: nlProfile,
  blog: nlBlog,
  auth: nlAuth,
};
export const nlSeoMessages: SeoMessages = {
  siteName: "Cosmediate",
  web: {
    defaultTitle: "Cosmediate",
    defaultDescription:
      "Vind, vergelijk en boek betrouwbare klinieken en specialisten voor cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity-behandelingen",
  },
  blog: {
    defaultTitle: "Cosmediate Blog",
    defaultDescription:
      "Expertartikelen over cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity-behandelingen.",
    collectionName: "Cosmediate Blog",
    readArticleBy: (title, author) =>
      `Lees ${title} door ${author} op de Cosmediate-blog.`,
  },
  notFound: {
    clinic: "Kliniek niet gevonden",
    specialist: "Specialist niet gevonden",
    treatment: "Behandeling niet gevonden",
    article: "Artikel niet gevonden",
  },
  entity: {
    specialistsCount: (count) => `${count} specialisten`,
    treatmentsCount: (count) => `${count} behandelingen`,
    reviewsCount: (count) => `${count} beoordelingen`,
    reviewsWithRating: (count, rating) =>
      `${count} beoordelingen (★ ${rating})`,
    viewClinicDetails: "Bekijk prijzen, kwalificaties, behandelingen en FAQ's.",
    viewSpecialistDetails:
      "Bekijk behandelingen, prijzen, kwalificaties en FAQ's.",
    findTreatmentProviders:
      "Vind klinieken en specialisten die deze behandeling aanbieden.",
    categoryLabel: (name) => `Categorie: ${name}.`,
  },
  clinic: {
    bookInCity: (name, city) => `Boek bij ${name} in ${city}.`,
    bookOnPlatform: (name) => `Boek bij ${name} op Cosmediate.`,
  },
  specialist: {
    bookConsultation: (name, city) =>
      city
        ? `Boek een consult met ${name} in ${city} op Cosmediate.`
        : `Boek een consult met ${name} op Cosmediate.`,
  },
  treatment: {
    learnAbout: (name) => `Lees meer over ${name} op Cosmediate.`,
  },
  listings: {
    clinics: {
      title: "Vind klinieken",
      description:
        "Bekijk betrouwbare klinieken voor cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity-behandelingen.",
      label: "Klinieken",
    },
    specialists: {
      title: "Vind specialisten",
      description:
        "Vind specialisten in cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity-behandelingen.",
      label: "Specialisten",
    },
    treatments: {
      title: "Bekijk behandelingen",
      description:
        "Ontdek cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity-behandelingen op Cosmediate.",
      label: "Behandelingen",
    },
  },
  marketing: {
    home: {
      title: "Cosmediate",
      description:
        "Vind geverifieerde klinieken, specialisten en behandelingen voor cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity. Ontdek behandelingen, vergelijk klinieken en boek uw afspraak.",
    },
    about: {
      title: "Over ons",
      description:
        "Lees meer over Cosmediate, het platform dat patiënten verbindt met geverifieerde klinieken en specialisten in cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity-behandelingen.",
    },
    contact: {
      title: "Contact",
      description:
        "Neem contact op met het Cosmediate-team. Vragen over klinieken, specialisten, behandelingen, partnerships of het gebruik van het platform.",
    },
    vacancies: {
      title: "Vacatures",
      description:
        "Ontdek carrièremogelijkheden bij Cosmediate en word onderdeel van ons team dat het platform bouwt voor cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity-behandelingen.",
    },
    partnersClinics: {
      title: "Informatie voor klinieken",
      description:
        "Werk samen met Cosmediate om uw kliniek te laten groeien, uw profiel te beheren en patiënten te bereiken die zoeken naar cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity-behandelingen.",
    },
    registerClinic: {
      title: "Registreer uw kliniek",
      description:
        "Registreer uw kliniek op Cosmediate en bereik patiënten die zoeken naar cosmetische zorg, plastische chirurgie, dermatologie, esthetische tandheelkunde en longevity-behandelingen.",
    },
    registerDoctor: {
      title: "Registreer als specialist",
      description:
        "Registreer als specialist op Cosmediate. Presenteer uw expertise en verbind met patiënten die op zoek zijn naar betrouwbare esthetische en medisch-esthetische zorg.",
    },
    privacyPolicy: {
      title: "Privacybeleid",
      description:
        "Lees het privacybeleid van Cosmediate en hoe wij met uw gegevens omgaan.",
    },
    termsAndConditions: {
      title: "Algemene voorwaarden",
      description:
        "Lees de algemene voorwaarden van Cosmediate voor het gebruik van ons platform.",
    },
  },
  nav: nlNav,
  profileSeo: {
    clinicSummary: (name) => `Samenvatting van ${name}`,
    specialistSummary: (name) => `Samenvatting van ${name}`,
    treatmentSummary: (name) => `Samenvatting van ${name}`,
    specialistsAtClinic: "Specialisten bij deze kliniek",
    treatmentsAtClinic: "Behandelingen bij deze kliniek",
    clinicsForSpecialist: "Klinieken voor deze specialist",
    treatmentsBySpecialist: "Behandelingen door deze specialist",
    clinicsOfferingTreatment: "Klinieken die deze behandeling aanbieden",
    specialistsOfferingTreatment: "Specialisten die deze behandeling aanbieden",
    specialistFallback: "Specialist",
  },
};
