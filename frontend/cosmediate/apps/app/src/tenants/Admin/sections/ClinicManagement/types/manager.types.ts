import { z } from "zod";
import { ClinicManager } from "@cosmediate/type-utils/auth";
import { ManagerFormSchema } from "../schemas/managerForm.schema";

export type ManagerFormValues = z.infer<typeof ManagerFormSchema>;

export type UserStatus = "ACTIVE" | "BLOCKED" | "PENDING" | "UNCONFIRMED";

export interface ManagerFormProps {
  initialData?: ClinicManager;
  onSubmit: (data: Partial<ManagerFormValues>) => Promise<void>;
  isSubmitting?: boolean;
  isUpdate?: boolean;
  submitLabel: string;
}

export interface ContactSectionProps {
  email: string;
}
