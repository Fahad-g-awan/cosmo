import { z } from "zod";
import { Specialist } from "@cosmediate/type-utils";

import { SpecialistFormObjectSchema } from "../schemas/specialistForm.schema";

export type SpecialistFormValues = z.infer<typeof SpecialistFormObjectSchema>;

export interface SpecialistFormProps {
  initialData?: Partial<Specialist>;
  onSubmit: (data: Partial<SpecialistFormValues>) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  isUpdate?: boolean;
  /** Clinic dashboard: FT-only create, transfer note, freelance read-only. */
  clinicDashboard?: boolean;
  readOnly?: boolean;
  defaultParentClinicId?: string;
}
