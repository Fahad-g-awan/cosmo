import { z } from "zod";
import type { Specialist } from "@cosmediate/type-utils";
import type { ClinicManager } from "@cosmediate/type-utils/auth";
import type { AccountProfileRole } from "./profile.constants";
import { ProfileFormSchema } from "./profile.schema";

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
export type AccountProfileEntity = ClinicManager | Specialist;

export interface ProfileFormProps {
  role: AccountProfileRole;
  initialData: AccountProfileEntity;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ContactSectionProps {
  email: string;
}
