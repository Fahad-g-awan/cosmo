export interface FormValidationMessages {
  firstNameRequired: string;
  surnameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  phoneRequired: string;
  subjectRequired: string;
  messageRequired: string;
  companyNameRequired: string;
  registrationNumberRequired: string;
}

export interface FormMessages {
  labels: {
    firstName: string;
    surname: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    companyName: string;
    registrationNumber: string;
  };
  placeholders: {
    firstName: string;
    surname: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    companyName: string;
    registrationNumber: string;
  };
  validation: FormValidationMessages;
  toasts: {
    requiredFields: string;
    captchaFailed: string;
    success: string;
    submitError: string;
  };
  privacy: {
    title: string;
    textBeforeLink: string;
    linkLabel: string;
  };
  submit: string;
}
