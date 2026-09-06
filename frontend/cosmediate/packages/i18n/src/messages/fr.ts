import type {
  CommonMessages,
  NavMessages,
  SeoMessages,
  UiMessages,
} from "../types";
import { frFooter, frHeader } from "../chrome/fr";
import { frMarketing } from "../marketing/fr";
import { frProfile } from "../profile/fr";
import { frBrowse } from "../browse/fr";
import { frForms } from "../forms/fr";
import { frBlog } from "../blog/fr";
import { frAuth } from "../auth/fr";

export const frNav: NavMessages = {
  treatments: "Traitements",
  clinics: "Cliniques",
  specialists: "Spécialistes",
  blog: "Blog",
  about: "À propos",
  contact: "Contact",
  home: "Accueil",
  browseCosmediate: "Parcourir Cosmediate",
  allClinics: "Toutes les cliniques",
  allSpecialists: "Tous les spécialistes",
  allTreatments: "Tous les traitements",
};

export const frCommon: CommonMessages = {
  tryAgain: "Réessayer",
  pleaseTryAgain: "Veuillez réessayer",
  pleaseTryAgainLater: "Veuillez réessayer plus tard",
  dataNotFound: "Données introuvables",
  loading: "Chargement...",
};

export const frUiMessages: UiMessages = {
  common: frCommon,
  nav: frNav,
  header: frHeader,
  footer: frFooter,
  marketing: frMarketing,
  forms: frForms,
  browse: frBrowse,
  profile: frProfile,
  blog: frBlog,
  auth: frAuth,
};

export const frSeoMessages: SeoMessages = {
  siteName: "Cosmediate",
  web: {
    defaultTitle: "Cosmediate",
    defaultDescription:
      "Trouvez, comparez et réservez des cliniques et des spécialistes de confiance pour les soins esthétiques, la chirurgie plastique, la dermatologie, les soins dentaires esthétiques et les traitements de longévité",
  },
  blog: {
    defaultTitle: "Blog Cosmediate",
    defaultDescription:
      "Articles d'experts sur les soins esthétiques, la chirurgie plastique, la dermatologie, les soins dentaires esthétiques et les traitements de longévité.",
    collectionName: "Blog Cosmediate",
    readArticleBy: (title, author) =>
      `Lisez ${title} par ${author} sur le blog Cosmediate.`,
  },
  notFound: {
    clinic: "Clinique introuvable",
    specialist: "Spécialiste introuvable",
    treatment: "Traitement introuvable",
    article: "Article introuvable",
  },
  entity: {
    specialistsCount: (count) => `${count} spécialistes`,
    treatmentsCount: (count) => `${count} traitements`,
    reviewsCount: (count) => `${count} avis`,
    reviewsWithRating: (count, rating) => `${count} avis (★ ${rating})`,
    viewClinicDetails:
      "Consultez les prix, les qualifications, les traitements et la FAQ.",
    viewSpecialistDetails:
      "Consultez les traitements, les prix, les qualifications et la FAQ.",
    findTreatmentProviders:
      "Trouvez des cliniques et des spécialistes proposant ce traitement.",
    categoryLabel: (name) => `Catégorie : ${name}.`,
  },
  clinic: {
    bookInCity: (name, city) => `Réservez chez ${name} à ${city}.`,
    bookOnPlatform: (name) => `Réservez chez ${name} sur Cosmediate.`,
  },
  specialist: {
    bookConsultation: (name, city) =>
      city
        ? `Réservez une consultation avec ${name} à ${city} sur Cosmediate.`
        : `Réservez une consultation avec ${name} sur Cosmediate.`,
  },
  treatment: {
    learnAbout: (name) => `Découvrez ${name} sur Cosmediate.`,
  },
  listings: {
    clinics: {
      title: "Trouver des cliniques",
      description:
        "Parcourez des cliniques de confiance pour les soins esthétiques, la chirurgie plastique, la dermatologie, les soins dentaires esthétiques et les traitements de longévité.",
      label: "Cliniques",
    },
    specialists: {
      title: "Trouver des spécialistes",
      description:
        "Trouvez des spécialistes en soins esthétiques, chirurgie plastique, dermatologie, soins dentaires esthétiques et traitements de longévité.",
      label: "Spécialistes",
    },
    treatments: {
      title: "Parcourir les traitements",
      description:
        "Explorez les soins esthétiques, la chirurgie plastique, la dermatologie, les soins dentaires esthétiques et les traitements de longévité sur Cosmediate.",
      label: "Traitements",
    },
  },
  marketing: {
    home: {
      title: "Cosmediate",
      description:
        "Trouvez des cliniques, des spécialistes et des traitements vérifiés pour les soins esthétiques, la chirurgie plastique, la dermatologie, les soins dentaires esthétiques et la longévité. Explorez les traitements, comparez les cliniques et réservez votre rendez-vous.",
    },
    about: {
      title: "À propos",
      description:
        "Découvrez Cosmediate, la plateforme qui connecte les patients avec des cliniques et des spécialistes vérifiés en soins esthétiques, chirurgie plastique, dermatologie, soins dentaires esthétiques et traitements de longévité.",
    },
    contact: {
      title: "Contact",
      description:
        "Contactez l'équipe Cosmediate. Questions sur les cliniques, les spécialistes, les traitements, les partenariats ou l'utilisation de la plateforme.",
    },
    vacancies: {
      title: "Offres d'emploi",
      description:
        "Découvrez les opportunités de carrière chez Cosmediate et rejoignez notre équipe qui construit la plateforme pour les soins esthétiques, la chirurgie plastique, la dermatologie, les soins dentaires esthétiques et les traitements de longévité.",
    },
    partnersClinics: {
      title: "Informations pour les cliniques",
      description:
        "Associez-vous à Cosmediate pour développer votre clinique, gérer votre profil et atteindre les patients recherchant des soins esthétiques, de la chirurgie plastique, de la dermatologie, des soins dentaires esthétiques et des traitements de longévité.",
    },
    registerClinic: {
      title: "Inscrire votre clinique",
      description:
        "Inscrivez votre clinique sur Cosmediate et atteignez les patients recherchant des soins esthétiques, de la chirurgie plastique, de la dermatologie, des soins dentaires esthétiques et des traitements de longévité.",
    },
    registerDoctor: {
      title: "S'inscrire comme spécialiste",
      description:
        "Inscrivez-vous comme spécialiste sur Cosmediate. Mettez en valeur votre expertise et connectez-vous avec des patients recherchant des soins esthétiques et médico-esthétiques de confiance.",
    },
    privacyPolicy: {
      title: "Politique de confidentialité",
      description:
        "Consultez la politique de confidentialité de Cosmediate et la manière dont nous traitons vos données.",
    },
    termsAndConditions: {
      title: "Conditions générales",
      description:
        "Consultez les conditions générales de Cosmediate pour l'utilisation de notre plateforme.",
    },
  },
  nav: frNav,
  profileSeo: {
    clinicSummary: (name) => `Résumé de ${name}`,
    specialistSummary: (name) => `Résumé de ${name}`,
    treatmentSummary: (name) => `Résumé de ${name}`,
    specialistsAtClinic: "Spécialistes dans cette clinique",
    treatmentsAtClinic: "Traitements dans cette clinique",
    clinicsForSpecialist: "Cliniques pour ce spécialiste",
    treatmentsBySpecialist: "Traitements par ce spécialiste",
    clinicsOfferingTreatment: "Cliniques proposant ce traitement",
    specialistsOfferingTreatment: "Spécialistes proposant ce traitement",
    specialistFallback: "Spécialiste",
  },
};
