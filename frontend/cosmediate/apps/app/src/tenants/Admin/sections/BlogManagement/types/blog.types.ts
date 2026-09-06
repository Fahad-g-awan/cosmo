import { z } from "zod";
import { BlogFormSchema } from "../schemas/blogForm.schema";
import { Blog } from "@cosmediate/type-utils/blog";

export type BlogFormValues = z.infer<typeof BlogFormSchema>;

export type UserStatus = "ACTIVE" | "BLOCKED" | "PENDING" | "UNCONFIRMED";

export interface BlogFormProps {
  initialData?: Partial<Blog>;
  onSubmit: (data: BlogFormValues) => Promise<void>;
  isSubmitting?: boolean;
  isUpdate?: boolean;
  submitLabel?: string;
}
