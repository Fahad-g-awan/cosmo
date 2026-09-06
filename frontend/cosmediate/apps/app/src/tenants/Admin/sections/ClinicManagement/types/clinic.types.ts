import { z } from "zod";
import { ClinicFormObjectSchema } from "../schemas/clinicForm.schema";
import { Clinic } from "@cosmediate/type-utils/clinic";

export type ClinicFormValues = z.infer<typeof ClinicFormObjectSchema>;

export interface ClinicFormProps {
  initialData?: Partial<Clinic>;
  onSubmit: (data: Partial<ClinicFormValues>) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  mode?: "create" | "update";
}
