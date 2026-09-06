import { z } from "zod";
import { Admin } from "@cosmediate/type-utils/auth";
import { AdminFormSchema } from "../schemas/adminForm.schema";

export type AdminFormValues = z.infer<typeof AdminFormSchema>;

export type UserStatus = "ACTIVE" | "BLOCKED" | "PENDING" | "UNCONFIRMED";

export interface AdminFormProps {
  initialData?: Admin;
  onSubmit: (data: Partial<AdminFormValues>) => Promise<void>;
  isSubmitting?: boolean;
  isUpdate?: boolean;
  submitLabel: string;
}

export interface ContactSectionProps {
  email: string;
}
