import { z } from "zod";
import { CategoryFormSchema } from "../schemas/blogCategoryForm.schema";
import { BlogCategory } from "@cosmediate/type-utils/blog";

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

export interface CategoryFormProps {
  initialData?: Partial<BlogCategory>;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  mode?: "single" | "multiple";
}
