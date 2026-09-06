import { z } from "zod";
import { CategoryFormSchema } from "../schemas/treatmentCategoryForm.schema";
import { TreatmentCategory } from "@cosmediate/type-utils";

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

export interface CategoryFormProps {
  initialData?: Partial<TreatmentCategory>;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  mode?: "single" | "multiple";
}
