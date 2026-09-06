import type { FormMessages } from "./types";

export const elForms: FormMessages = {
  labels: {
    firstName: "Όνομα",
    surname: "Επώνυμο",
    email: "E-mail",
    phone: "Αριθμός τηλεφώνου",
    subject: "Θέμα",
    message: "Μήνυμα",
    companyName: "Επωνυμία εταιρείας κλινικής",
    registrationNumber: "Αριθμός εγγραφής BIG",
  },
  placeholders: {
    firstName: "Όνομα",
    surname: "Επώνυμο",
    email: "Εισαγάγετε e-mail",
    phone: "Εισαγάγετε αριθμό τηλεφώνου",
    subject: "Εισαγάγετε θέμα",
    message: "Εισαγάγετε το μήνυμά σας",
    companyName: "Επωνυμία εταιρείας κλινικής",
    registrationNumber: "Αριθμός εγγραφής BIG",
  },
  validation: {
    firstNameRequired: "Το όνομα είναι υποχρεωτικό",
    surnameRequired: "Το επώνυμο είναι υποχρεωτικό",
    emailRequired: "Το e-mail είναι υποχρεωτικό",
    emailInvalid: "Εισαγάγετε μια έγκυρη διεύθυνση e-mail",
    phoneRequired: "Ο αριθμός τηλεφώνου είναι υποχρεωτικός",
    subjectRequired: "Το θέμα είναι υποχρεωτικό",
    messageRequired: "Το μήνυμα είναι υποχρεωτικό",
    companyNameRequired: "Η επωνυμία εταιρείας κλινικής είναι υποχρεωτική",
    registrationNumberRequired: "Ο αριθμός εγγραφής BIG είναι υποχρεωτικός",
  },
  toasts: {
    requiredFields: "Συμπληρώστε σωστά όλα τα υποχρεωτικά πεδία.",
    captchaFailed: "Το captcha απέτυχε. Δοκιμάστε ξανά.",
    success: "Ευχαριστούμε! Η φόρμα υποβλήθηκε με επιτυχία.",
    submitError: "Η υποβολή της φόρμας απέτυχε. Δοκιμάστε ξανά αργότερα.",
  },
  privacy: {
    title: "Ειδοποίηση πολιτικής απορρήτου",
    textBeforeLink:
      "Η Cosmediate χρειάζεται τα στοιχεία επικοινωνίας που μας παρέχετε για να επικοινωνήσει μαζί σας σχετικά με τα προϊόντα και τις υπηρεσίες μας. Μπορείτε να διαγραφείτε από αυτές τις επικοινωνίες ανά πάσα στιγμή. Για πληροφορίες σχετικά με τον τρόπο διαγραφής, καθώς και τις πρακτικές απορρήτου μας και τη δέσμευσή μας να προστατεύουμε και να σεβόμαστε το απόρρητό σας, ανατρέξτε στην ",
    linkLabel: "Πολιτική απορρήτου.",
  },
  submit: "Αποστολή",
};
