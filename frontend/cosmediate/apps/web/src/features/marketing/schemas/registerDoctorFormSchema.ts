import { z } from "zod";

import type { FormValidationMessages } from "@cosmediate/i18n";

export interface RegisterDoctorFormValues extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  registrationNumber: string;
}

export function createRegisterDoctorFormSchema(
  validation: FormValidationMessages,
) {
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
    registrationNumber: z
      .string()
      .min(1, validation.registrationNumberRequired),
  });
}

export const defaultRegisterDoctorFormValues: RegisterDoctorFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  registrationNumber: "",
};
