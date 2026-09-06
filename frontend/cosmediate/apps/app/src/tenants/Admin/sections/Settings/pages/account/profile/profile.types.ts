import { z } from "zod";
import { Admin } from "@cosmediate/type-utils/auth";
import { ProfileFormSchema } from "./profile.schema";

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

export interface ProfileFormProps {
  initialData: Admin;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ContactSectionProps {
  email: string;
}
