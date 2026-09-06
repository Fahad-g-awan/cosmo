import { z } from "zod";

/** Cognito-aligned policy: upper, lower, digit, special, min 8. */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const STRONG_PASSWORD_MESSAGE =
  "Password must contain uppercase, lowercase, number, and special character";

export const strongPasswordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(STRONG_PASSWORD_REGEX, STRONG_PASSWORD_MESSAGE);

export const SetPasswordFormSchema = z
  .object({
    oldPassword: z.string().optional(),
    newPassword: strongPasswordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const UpdatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPasswordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "New password cannot be the same as current password",
    path: ["newPassword"],
  });

/** AJV `/password` (set) and `/newPassword` (update) → form field. */
export const PASSWORD_FORM_FIELD_MAP: Record<string, string> = {
  password: "newPassword",
  newPassword: "newPassword",
  oldPassword: "oldPassword",
};
