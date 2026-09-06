import { z } from "zod";
import { TreatmentResultFormSchema } from "../schemas/treatmentResultForm.schema";

export type TreatmentResultFormValues = z.infer<
  typeof TreatmentResultFormSchema
>;

export type TreatmentResultFormData = TreatmentResultFormValues & {
  id?: string;
};

export interface TreatmentResultFormProps {
  initialData?: TreatmentResultFormData;
  onSubmit: (data: TreatmentResultFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  isUpdate?: boolean;
  clinicGalleryMode?: boolean;
}
