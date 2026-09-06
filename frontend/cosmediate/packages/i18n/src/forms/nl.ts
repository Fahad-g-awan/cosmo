import type { FormMessages } from "./types";

export const nlForms: FormMessages = {
  labels: {
    firstName: "Voornaam",
    surname: "Achternaam",
    email: "E-mail",
    phone: "Telefoonnummer",
    subject: "Onderwerp",
    message: "Bericht",
    companyName: "Bedrijfsnaam kliniek",
    registrationNumber: "BIG-registratienummer",
  },
  placeholders: {
    firstName: "Voornaam",
    surname: "Achternaam",
    email: "Voer e-mailadres in",
    phone: "Voer telefoonnummer in",
    subject: "Voer onderwerp in",
    message: "Voer uw bericht in",
    companyName: "Bedrijfsnaam kliniek",
    registrationNumber: "BIG-registratienummer",
  },
  validation: {
    firstNameRequired: "Voornaam is verplicht",
    surnameRequired: "Achternaam is verplicht",
    emailRequired: "E-mailadres is verplicht",
    emailInvalid: "Voer een geldig e-mailadres in",
    phoneRequired: "Telefoonnummer is verplicht",
    subjectRequired: "Onderwerp is verplicht",
    messageRequired: "Bericht is verplicht",
    companyNameRequired: "Bedrijfsnaam kliniek is verplicht",
    registrationNumberRequired: "BIG-registratienummer is verplicht",
  },
  toasts: {
    requiredFields: "Vul alle verplichte velden correct in.",
    captchaFailed: "Captcha mislukt. Probeer het opnieuw.",
    success: "Bedankt! Uw formulier is succesvol verzonden.",
    submitError: "Het formulier kon niet worden verzonden. Probeer het later opnieuw.",
  },
  privacy: {
    title: "Privacyverklaring",
    textBeforeLink:
      "Cosmediate heeft de contactgegevens die u aan ons verstrekt nodig om contact met u op te nemen over onze producten en diensten. U kunt zich op elk moment afmelden voor deze communicatie. Voor informatie over hoe u zich kunt afmelden, evenals onze privacypraktijken en onze toewijding aan het beschermen en respecteren van uw privacy, raadpleeg ons ",
    linkLabel: "Privacybeleid.",
  },
  submit: "Verzenden",
};
