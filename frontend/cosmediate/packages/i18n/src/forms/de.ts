import type { FormMessages } from "./types";

export const deForms: FormMessages = {
  labels: {
    firstName: "Vorname",
    surname: "Nachname",
    email: "E-Mail",
    phone: "Telefonnummer",
    subject: "Betreff",
    message: "Nachricht",
    companyName: "Firmenname der Klinik",
    registrationNumber: "BIG-Registrierungsnummer",
  },
  placeholders: {
    firstName: "Vorname",
    surname: "Nachname",
    email: "E-Mail-Adresse eingeben",
    phone: "Telefonnummer eingeben",
    subject: "Betreff eingeben",
    message: "Ihre Nachricht eingeben",
    companyName: "Firmenname der Klinik",
    registrationNumber: "BIG-Registrierungsnummer",
  },
  validation: {
    firstNameRequired: "Vorname ist erforderlich",
    surnameRequired: "Nachname ist erforderlich",
    emailRequired: "E-Mail-Adresse ist erforderlich",
    emailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    phoneRequired: "Telefonnummer ist erforderlich",
    subjectRequired: "Betreff ist erforderlich",
    messageRequired: "Nachricht ist erforderlich",
    companyNameRequired: "Firmenname der Klinik ist erforderlich",
    registrationNumberRequired: "BIG-Registrierungsnummer ist erforderlich",
  },
  toasts: {
    requiredFields: "Bitte füllen Sie alle Pflichtfelder korrekt aus.",
    captchaFailed: "Captcha fehlgeschlagen. Bitte versuchen Sie es erneut.",
    success: "Vielen Dank! Ihr Formular wurde erfolgreich übermittelt.",
    submitError:
      "Das Formular konnte nicht übermittelt werden. Bitte versuchen Sie es später erneut.",
  },
  privacy: {
    title: "Hinweis zum Datenschutz",
    textBeforeLink:
      "Cosmediate benötigt die von Ihnen angegebenen Kontaktdaten, um Sie über unsere Produkte und Dienstleistungen zu kontaktieren. Sie können diese Mitteilungen jederzeit abbestellen. Informationen zum Abbestellen sowie zu unseren Datenschutzpraktiken und unserem Engagement zum Schutz und zur Achtung Ihrer Privatsphäre finden Sie in unserer ",
    linkLabel: "Datenschutzerklärung.",
  },
  submit: "Senden",
};
