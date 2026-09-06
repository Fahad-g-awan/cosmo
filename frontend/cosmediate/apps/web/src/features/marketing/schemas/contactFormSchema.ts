import { z } from "zod";

import type { FormValidationMessages } from "@cosmediate/i18n";

export interface ContactFormValues extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export function createContactFormSchema(validation: FormValidationMessages) {
  return z.object({
    firstName: z.string().min(1, validation.firstNameRequired),
    lastName: z.string().min(1, validation.surnameRequired),
    email: z
      .string()
      .min(1, validation.emailRequired)
      .email(validation.emailInvalid),
    phone: z.string().min(1, validation.phoneRequired),
    subject: z.string().min(1, validation.subjectRequired),
    message: z.string().min(1, validation.messageRequired),
  });
}

export const defaultContactFormValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};
