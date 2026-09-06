import { z } from "zod";
import { BrandFormSchema } from "../schemas/brandForm.schema";
import { TreatmentBrand } from "@cosmediate/type-utils";

export type BrandFormValues = z.infer<typeof BrandFormSchema>;

export interface BrandFormProps {
  initialData?: Partial<TreatmentBrand>;
  onSubmit: (data: BrandFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  mode?: "single" | "multiple";
}
