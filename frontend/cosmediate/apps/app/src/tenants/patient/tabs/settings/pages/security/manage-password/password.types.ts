import { SetPasswordFormSchema } from "./password.schema";
import { z } from "zod";

export type PasswordFormValues = z.infer<typeof SetPasswordFormSchema>;

export interface PasswordFormProps {
  userHasPassword: boolean;
  onSubmit: (values: PasswordFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export interface PasswordFieldProps {
  path: keyof PasswordFormValues;
  label: string;
  placeholder: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  hint?: string;
}
