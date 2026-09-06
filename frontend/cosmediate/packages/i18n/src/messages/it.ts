import type {
  CommonMessages,
  NavMessages,
  SeoMessages,
  UiMessages,
} from "../types";
import { itFooter, itHeader } from "../chrome/it";
import { itMarketing } from "../marketing/it";
import { itProfile } from "../profile/it";
import { itBrowse } from "../browse/it";
import { itForms } from "../forms/it";
import { itBlog } from "../blog/it";
import { itAuth } from "../auth/it";

export const itNav: NavMessages = {
  treatments: "Trattamenti",
  clinics: "Cliniche",
  specialists: "Specialisti",
  blog: "Blog",
  about: "Chi siamo",
  contact: "Contatti",
  home: "Home",
  browseCosmediate: "Sfoglia Cosmediate",
  allClinics: "Tutte le cliniche",
  allSpecialists: "Tutti gli specialisti",
  allTreatments: "Tutti i trattamenti",
};

export const itCommon: CommonMessages = {
  tryAgain: "Riprova",
  pleaseTryAgain: "Riprova",
  pleaseTryAgainLater: "Riprova più tardi",
  dataNotFound: "Dati non trovati",
  loading: "Caricamento...",
};

export const itUiMessages: UiMessages = {
  common: itCommon,
  nav: itNav,
  header: itHeader,
  footer: itFooter,
  marketing: itMarketing,
  forms: itForms,
  browse: itBrowse,
  profile: itProfile,
  blog: itBlog,
  auth: itAuth,
};

export const itSeoMessages: SeoMessages = {
  siteName: "Cosmediate",
  web: {
    defaultTitle: "Cosmediate",
    defaultDescription:
      "Trova, confronta e prenota cliniche e specialisti affidabili per cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e trattamenti di longevità",
  },
  blog: {
    defaultTitle: "Blog Cosmediate",
    defaultDescription:
      "Articoli di esperti su cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e trattamenti di longevità.",
    collectionName: "Blog Cosmediate",
    readArticleBy: (title, author) =>
      `Leggi ${title} di ${author} sul blog Cosmediate.`,
  },
  notFound: {
    clinic: "Clinica non trovata",
    specialist: "Specialista non trovato",
    treatment: "Trattamento non trovato",
    article: "Articolo non trovato",
  },
  entity: {
    specialistsCount: (count) => `${count} specialisti`,
    treatmentsCount: (count) => `${count} trattamenti`,
    reviewsCount: (count) => `${count} recensioni`,
    reviewsWithRating: (count, rating) => `${count} recensioni (★ ${rating})`,
    viewClinicDetails:
      "Visualizza prezzi, qualifiche, trattamenti e domande frequenti.",
    viewSpecialistDetails:
      "Visualizza trattamenti, prezzi, qualifiche e domande frequenti.",
    findTreatmentProviders:
      "Trova cliniche e specialisti che offrono questo trattamento.",
    categoryLabel: (name) => `Categoria: ${name}.`,
  },
  clinic: {
    bookInCity: (name, city) => `Prenota presso ${name} a ${city}.`,
    bookOnPlatform: (name) => `Prenota presso ${name} su Cosmediate.`,
  },
  specialist: {
    bookConsultation: (name, city) =>
      city
        ? `Prenota una consulenza con ${name} a ${city} su Cosmediate.`
        : `Prenota una consulenza con ${name} su Cosmediate.`,
  },
  treatment: {
    learnAbout: (name) => `Scopri ${name} su Cosmediate.`,
  },
  listings: {
    clinics: {
      title: "Trova cliniche",
      description:
        "Sfoglia cliniche affidabili per cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e trattamenti di longevità.",
      label: "Cliniche",
    },
    specialists: {
      title: "Trova specialisti",
      description:
        "Trova specialisti in cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e trattamenti di longevità.",
      label: "Specialisti",
    },
    treatments: {
      title: "Sfoglia trattamenti",
      description:
        "Esplora cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e trattamenti di longevità su Cosmediate.",
      label: "Trattamenti",
    },
  },
  marketing: {
    home: {
      title: "Cosmediate",
      description:
        "Trova cliniche, specialisti e trattamenti verificati per cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e longevità. Esplora i trattamenti, confronta le cliniche e prenota il tuo appuntamento.",
    },
    about: {
      title: "Chi siamo",
      description:
        "Scopri Cosmediate, la piattaforma che connette i pazienti con cliniche e specialisti verificati in cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e trattamenti di longevità.",
    },
    contact: {
      title: "Contatti",
      description:
        "Contatta il team Cosmediate. Domande su cliniche, specialisti, trattamenti, partnership o utilizzo della piattaforma.",
    },
    vacancies: {
      title: "Posizioni aperte",
      description:
        "Scopri le opportunità di carriera in Cosmediate e unisciti al nostro team che costruisce la piattaforma per cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e trattamenti di longevità.",
    },
    partnersClinics: {
      title: "Informazioni per le cliniche",
      description:
        "Collabora con Cosmediate per far crescere la tua clinica, gestire il tuo profilo e raggiungere pazienti in cerca di cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e trattamenti di longevità.",
    },
    registerClinic: {
      title: "Registra la tua clinica",
      description:
        "Registra la tua clinica su Cosmediate e raggiungi pazienti in cerca di cure estetiche, chirurgia plastica, dermatologia, odontoiatria estetica e trattamenti di longevità.",
    },
    registerDoctor: {
      title: "Registrati come specialista",
      description:
        "Registrati come specialista su Cosmediate. Mostra la tua competenza e connettiti con pazienti in cerca di cure estetiche e medico-estetiche affidabili.",
    },
    privacyPolicy: {
      title: "Informativa sulla privacy",
      description:
        "Leggi l'informativa sulla privacy di Cosmediate e come gestiamo i tuoi dati.",
    },
    termsAndConditions: {
      title: "Termini e condizioni",
      description:
        "Leggi i termini e le condizioni di Cosmediate per l'utilizzo della nostra piattaforma.",
    },
  },
  nav: itNav,
  profileSeo: {
    clinicSummary: (name) => `Riepilogo di ${name}`,
    specialistSummary: (name) => `Riepilogo di ${name}`,
    treatmentSummary: (name) => `Riepilogo di ${name}`,
    specialistsAtClinic: "Specialisti in questa clinica",
    treatmentsAtClinic: "Trattamenti in questa clinica",
    clinicsForSpecialist: "Cliniche per questo specialista",
    treatmentsBySpecialist: "Trattamenti di questo specialista",
    clinicsOfferingTreatment: "Cliniche che offrono questo trattamento",
    specialistsOfferingTreatment: "Specialisti che offrono questo trattamento",
    specialistFallback: "Specialista",
  },
};
