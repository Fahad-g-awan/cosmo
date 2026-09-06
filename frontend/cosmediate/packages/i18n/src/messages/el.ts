import type {
  CommonMessages,
  NavMessages,
  SeoMessages,
  UiMessages,
} from "../types";
import { elFooter, elHeader } from "../chrome/el";
import { elMarketing } from "../marketing/el";
import { elProfile } from "../profile/el";
import { elBrowse } from "../browse/el";
import { elForms } from "../forms/el";
import { elBlog } from "../blog/el";
import { elAuth } from "../auth/el";

export const elNav: NavMessages = {
  treatments: "Θεραπείες",
  clinics: "Κλινικές",
  specialists: "Ειδικοί",
  blog: "Blog",
  about: "Σχετικά",
  contact: "Επικοινωνία",
  home: "Αρχική",
  browseCosmediate: "Περιήγηση στην Cosmediate",
  allClinics: "Όλες οι κλινικές",
  allSpecialists: "Όλοι οι ειδικοί",
  allTreatments: "Όλες οι θεραπείες",
};

export const elCommon: CommonMessages = {
  tryAgain: "Δοκιμάστε ξανά",
  pleaseTryAgain: "Παρακαλώ δοκιμάστε ξανά",
  pleaseTryAgainLater: "Παρακαλώ δοκιμάστε ξανά αργότερα",
  dataNotFound: "Δεδομένα δεν βρέθηκαν",
  loading: "Φόρτωση...",
};

export const elUiMessages: UiMessages = {
  common: elCommon,
  nav: elNav,
  header: elHeader,
  footer: elFooter,
  marketing: elMarketing,
  forms: elForms,
  browse: elBrowse,
  profile: elProfile,
  blog: elBlog,
  auth: elAuth,
};

export const elSeoMessages: SeoMessages = {
  siteName: "Cosmediate",
  web: {
    defaultTitle: "Cosmediate",
    defaultDescription:
      "Βρείτε, συγκρίνετε και κλείστε αξιόπιστες κλινικές και ειδικούς για αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και θεραπείες longevity",
  },
  blog: {
    defaultTitle: "Blog Cosmediate",
    defaultDescription:
      "Άρθρα ειδικών για αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και θεραπείες longevity.",
    collectionName: "Blog Cosmediate",
    readArticleBy: (title, author) =>
      `Διαβάστε το ${title} από τον/την ${author} στο blog της Cosmediate.`,
  },
  notFound: {
    clinic: "Η κλινική δεν βρέθηκε",
    specialist: "Ο ειδικός δεν βρέθηκε",
    treatment: "Η θεραπεία δεν βρέθηκε",
    article: "Το άρθρο δεν βρέθηκε",
  },
  entity: {
    specialistsCount: (count) => `${count} ειδικοί`,
    treatmentsCount: (count) => `${count} θεραπείες`,
    reviewsCount: (count) => `${count} κριτικές`,
    reviewsWithRating: (count, rating) => `${count} κριτικές (★ ${rating})`,
    viewClinicDetails: "Δείτε τιμές, προσόντα, θεραπείες και συχνές ερωτήσεις.",
    viewSpecialistDetails:
      "Δείτε θεραπείες, τιμές, προσόντα και συχνές ερωτήσεις.",
    findTreatmentProviders:
      "Βρείτε κλινικές και ειδικούς που προσφέρουν αυτή τη θεραπεία.",
    categoryLabel: (name) => `Κατηγορία: ${name}.`,
  },
  clinic: {
    bookInCity: (name, city) => `Κλείστε ραντεβού στο ${name} στην ${city}.`,
    bookOnPlatform: (name) => `Κλείστε ραντεβού στο ${name} στην Cosmediate.`,
  },
  specialist: {
    bookConsultation: (name, city) =>
      city
        ? `Κλείστε συνεδρία με τον/την ${name} στην ${city} μέσω Cosmediate.`
        : `Κλείστε συνεδρία με τον/την ${name} μέσω Cosmediate.`,
  },
  treatment: {
    learnAbout: (name) => `Μάθετε για το ${name} στην Cosmediate.`,
  },
  listings: {
    clinics: {
      title: "Βρείτε κλινικές",
      description:
        "Περιηγηθείτε σε αξιόπιστες κλινικές για αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και θεραπείες longevity.",
      label: "Κλινικές",
    },
    specialists: {
      title: "Βρείτε ειδικούς",
      description:
        "Βρείτε ειδικούς σε αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και θεραπείες longevity.",
      label: "Ειδικοί",
    },
    treatments: {
      title: "Περιηγηθείτε σε θεραπείες",
      description:
        "Εξερευνήστε αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και θεραπείες longevity στην Cosmediate.",
      label: "Θεραπείες",
    },
  },
  marketing: {
    home: {
      title: "Cosmediate",
      description:
        "Βρείτε επαληθευμένες κλινικές, ειδικούς και θεραπείες για αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και longevity. Εξερευνήστε θεραπείες, συγκρίνετε κλινικές και κλείστε το ραντεβού σας.",
    },
    about: {
      title: "Σχετικά με εμάς",
      description:
        "Μάθετε για την Cosmediate, την πλατφόρμα που συνδέει ασθενείς με επαληθευμένες κλινικές και ειδικούς σε αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και θεραπείες longevity.",
    },
    contact: {
      title: "Επικοινωνία",
      description:
        "Επικοινωνήστε με την ομάδα της Cosmediate. Ερωτήσεις για κλινικές, ειδικούς, θεραπείες, συνεργασίες ή τη χρήση της πλατφόρμας.",
    },
    vacancies: {
      title: "Θέσεις εργασίας",
      description:
        "Ανακαλύψτε καριέρες στην Cosmediate και γίνετε μέλος της ομάδας που χτίζει την πλατφόρμα για αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και θεραπείες longevity.",
    },
    partnersClinics: {
      title: "Πληροφορίες για κλινικές",
      description:
        "Συνεργαστείτε με την Cosmediate για να αναπτύξετε την κλινική σας, να διαχειριστείτε το προφίλ σας και να φτάσετε ασθενείς που αναζητούν αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και θεραπείες longevity.",
    },
    registerClinic: {
      title: "Εγγράψτε την κλινική σας",
      description:
        "Εγγράψτε την κλινική σας στην Cosmediate και φτάστε ασθενείς που αναζητούν αισθητική φροντίδα, πλαστική χειρουργική, δερματολογία, αισθητική οδοντιατρική και θεραπείες longevity.",
    },
    registerDoctor: {
      title: "Εγγραφή ως ειδικός",
      description:
        "Εγγραφείτε ως ειδικός στην Cosmediate. Παρουσιάστε την εμπειρία σας και συνδεθείτε με ασθενείς που αναζητούν αξιόπιστη αισθητική και ιατροαισθητική φροντίδα.",
    },
    privacyPolicy: {
      title: "Πολιτική απορρήτου",
      description:
        "Διαβάστε την πολιτική απορρήτου της Cosmediate και πώς χειριζόμαστε τα δεδομένα σας.",
    },
    termsAndConditions: {
      title: "Όροι και προϋποθέσεις",
      description:
        "Διαβάστε τους όρους και τις προϋποθέσεις της Cosmediate για τη χρήση της πλατφόρμας μας.",
    },
  },
  nav: elNav,
  profileSeo: {
    clinicSummary: (name) => `Περίληψη ${name}`,
    specialistSummary: (name) => `Περίληψη ${name}`,
    treatmentSummary: (name) => `Περίληψη ${name}`,
    specialistsAtClinic: "Ειδικοί σε αυτή την κλινική",
    treatmentsAtClinic: "Θεραπείες σε αυτή την κλινική",
    clinicsForSpecialist: "Κλινικές για αυτόν τον ειδικό",
    treatmentsBySpecialist: "Θεραπείες από αυτόν τον ειδικό",
    clinicsOfferingTreatment: "Κλινικές που προσφέρουν αυτή τη θεραπεία",
    specialistsOfferingTreatment: "Ειδικοί που προσφέρουν αυτή τη θεραπεία",
    specialistFallback: "Ειδικός",
  },
};
