import { z } from "zod";
import { TreatmentResultFormSchema } from "../schemas/treatmentResultForm.schema";

export type TreatmentResultFormValues = z.infer<
  typeof TreatmentResultFormSchema
>;

export type TreatmentResultFormData = TreatmentResultFormValues & {
  id?: string;
  treatmentName?: string;
};

export interface TreatmentResultFormProps {
  initialData?: TreatmentResultFormData;
  onSubmit: (data: TreatmentResultFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  isUpdate?: boolean;
}
