import { z } from "zod";

import type { Patient } from "@cosmediate/type-utils/auth";
import { PatientFormSchema } from "../schemas/patientForm.schema";

export type PatientFormValues = z.infer<typeof PatientFormSchema>;

export type UserStatus = "ACTIVE" | "BLOCKED" | "PENDING" | "UNCONFIRMED";

export interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (data: Partial<PatientFormValues>) => Promise<void>;
  isSubmitting?: boolean;
  isUpdate?: boolean;
  submitLabel: string;
}

export interface ContactSectionProps {
  email: string;
}
