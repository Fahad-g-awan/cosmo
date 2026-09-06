import type { FormMessages } from "./types";

export const frForms: FormMessages = {
  labels: {
    firstName: "Prénom",
    surname: "Nom",
    email: "E-mail",
    phone: "Numéro de téléphone",
    subject: "Objet",
    message: "Message",
    companyName: "Nom de l'entreprise de la clinique",
    registrationNumber: "Numéro d'enregistrement BIG",
  },
  placeholders: {
    firstName: "Prénom",
    surname: "Nom",
    email: "Saisissez votre adresse e-mail",
    phone: "Saisissez votre numéro de téléphone",
    subject: "Saisissez l'objet",
    message: "Saisissez votre message",
    companyName: "Nom de l'entreprise de la clinique",
    registrationNumber: "Numéro d'enregistrement BIG",
  },
  validation: {
    firstNameRequired: "Le prénom est obligatoire",
    surnameRequired: "Le nom est obligatoire",
    emailRequired: "L'adresse e-mail est obligatoire",
    emailInvalid: "Veuillez saisir une adresse e-mail valide",
    phoneRequired: "Le numéro de téléphone est obligatoire",
    subjectRequired: "L'objet est obligatoire",
    messageRequired: "Le message est obligatoire",
    companyNameRequired: "Le nom de l'entreprise de la clinique est obligatoire",
    registrationNumberRequired: "Le numéro d'enregistrement BIG est obligatoire",
  },
  toasts: {
    requiredFields: "Veuillez remplir correctement tous les champs obligatoires.",
    captchaFailed: "Échec du captcha. Veuillez réessayer.",
    success: "Merci ! Votre formulaire a été envoyé avec succès.",
    submitError:
      "L'envoi du formulaire a échoué. Veuillez réessayer plus tard.",
  },
  privacy: {
    title: "Avis relatif à la politique de confidentialité",
    textBeforeLink:
      "Cosmediate a besoin des coordonnées que vous nous fournissez pour vous contacter au sujet de nos produits et services. Vous pouvez vous désabonner de ces communications à tout moment. Pour savoir comment vous désabonner, ainsi que pour connaître nos pratiques en matière de confidentialité et notre engagement à protéger et respecter votre vie privée, veuillez consulter notre ",
    linkLabel: "Politique de confidentialité.",
  },
  submit: "Envoyer",
};
