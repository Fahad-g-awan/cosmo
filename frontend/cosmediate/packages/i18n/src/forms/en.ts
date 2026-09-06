import type { FormMessages } from "./types";

export const enForms: FormMessages = {
  labels: {
    firstName: "First Name",
    surname: "Surname",
    email: "E-mail",
    phone: "Phone Number",
    subject: "Subject",
    message: "Message",
    companyName: "Clinic Company Name",
    registrationNumber: "BIG Registration Number",
  },
  placeholders: {
    firstName: "First name",
    surname: "Surname",
    email: "Enter email",
    phone: "Enter phone number",
    subject: "Enter subject",
    message: "Enter your message",
    companyName: "Clinic Company Name",
    registrationNumber: "BIG Registration Number",
  },
  validation: {
    firstNameRequired: "First name is required",
    surnameRequired: "Surname is required",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email address",
    phoneRequired: "Phone number is required",
    subjectRequired: "Subject is required",
    messageRequired: "Message is required",
    companyNameRequired: "Clinic company name is required",
    registrationNumberRequired: "BIG registration number is required",
  },
  toasts: {
    requiredFields: "Please fill in all required fields correctly.",
    captchaFailed: "Captcha failed. Try again.",
    success: "Thank you! Your form has been submitted successfully.",
    submitError: "Failed to submit form. Please try again later.",
  },
  privacy: {
    title: "Privacy Policy Notice",
    textBeforeLink:
      "Cosmediate needs the contact information you provide to us to contact you about our products and services. You may unsubscribe from these communications at any time. For information on how to unsubscribe, as well as our privacy practices and commitment to protecting and respecting your privacy, please review our ",
    linkLabel: "Privacy Policy.",
  },
  submit: "Send",
};
