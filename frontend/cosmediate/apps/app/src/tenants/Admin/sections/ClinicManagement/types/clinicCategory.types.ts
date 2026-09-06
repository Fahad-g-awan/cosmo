import { z } from "zod";
import { CategoryFormSchema } from "../schemas/clinicCategoryForm.schema";
import { ClinicCategory } from "@cosmediate/type-utils";

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

export interface CategoryFormProps {
  initialData?: Partial<ClinicCategory>;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  mode?: "single" | "multiple";
}
