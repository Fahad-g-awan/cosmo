import { z } from "zod";

import type { Patient } from "@cosmediate/type-utils/auth";
import { ProfileFormSchema } from "./profile.schema";

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

export interface ProfileFormProps {
  initialData: Patient;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ContactSectionProps {
  email: string;
}
