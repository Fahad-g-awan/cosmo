import { z } from "zod";
import { TreatmentFormSchema } from "../schemas/treatmentForm.schema";
import { Treatment } from "@cosmediate/type-utils";

export type TreatmentFormValues = z.infer<typeof TreatmentFormSchema>;

export type TreatmentFormData = Partial<Treatment & { id?: string }>;

export interface TreatmentFormProps {
  initialData?: TreatmentFormData;
  onSubmit: (data: TreatmentFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  isUpdate?: boolean;
}
