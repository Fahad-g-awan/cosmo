import type { FormMessages } from "./types";

export const itForms: FormMessages = {
  labels: {
    firstName: "Nome",
    surname: "Cognome",
    email: "E-mail",
    phone: "Numero di telefono",
    subject: "Oggetto",
    message: "Messaggio",
    companyName: "Ragione sociale della clinica",
    registrationNumber: "Numero di registrazione BIG",
  },
  placeholders: {
    firstName: "Nome",
    surname: "Cognome",
    email: "Inserisci l'indirizzo e-mail",
    phone: "Inserisci il numero di telefono",
    subject: "Inserisci l'oggetto",
    message: "Inserisci il tuo messaggio",
    companyName: "Ragione sociale della clinica",
    registrationNumber: "Numero di registrazione BIG",
  },
  validation: {
    firstNameRequired: "Il nome è obbligatorio",
    surnameRequired: "Il cognome è obbligatorio",
    emailRequired: "L'indirizzo e-mail è obbligatorio",
    emailInvalid: "Inserisci un indirizzo e-mail valido",
    phoneRequired: "Il numero di telefono è obbligatorio",
    subjectRequired: "L'oggetto è obbligatorio",
    messageRequired: "Il messaggio è obbligatorio",
    companyNameRequired: "La ragione sociale della clinica è obbligatoria",
    registrationNumberRequired: "Il numero di registrazione BIG è obbligatorio",
  },
  toasts: {
    requiredFields: "Compila correttamente tutti i campi obbligatori.",
    captchaFailed: "Captcha non riuscito. Riprova.",
    success: "Grazie! Il modulo è stato inviato con successo.",
    submitError: "Invio del modulo non riuscito. Riprova più tardi.",
  },
  privacy: {
    title: "Informativa sulla privacy",
    textBeforeLink:
      "Cosmediate necessita dei dati di contatto che ci fornisci per contattarti in merito ai nostri prodotti e servizi. Puoi annullare l'iscrizione a queste comunicazioni in qualsiasi momento. Per informazioni su come annullare l'iscrizione, nonché sulle nostre pratiche in materia di privacy e sul nostro impegno a proteggere e rispettare la tua privacy, consulta la nostra ",
    linkLabel: "Informativa sulla privacy.",
  },
  submit: "Invia",
};
