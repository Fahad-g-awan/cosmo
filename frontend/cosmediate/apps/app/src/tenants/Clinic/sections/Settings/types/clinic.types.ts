import { z } from "zod";
import { Clinic, Specialist } from "@cosmediate/type-utils";

import {
  ClinicSetupFormObjectSchema,
  SpecialistSetupFormObjectSchema,
} from "../schemas/clinicForm.schema";

export type ClinicFormValues = z.infer<typeof ClinicSetupFormObjectSchema> &
  Partial<z.infer<typeof SpecialistSetupFormObjectSchema>>;

export interface ClinicFormProps {
  initialData?: Partial<Clinic | Specialist>;
  onSubmit: (data: Partial<ClinicFormValues>) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}
