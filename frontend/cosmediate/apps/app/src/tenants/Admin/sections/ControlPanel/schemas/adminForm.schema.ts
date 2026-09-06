import { z } from "zod";

import {
  ENTITY_NAME_MAX_LENGTH,
  ENTITY_NAME_MIN_LENGTH,
} from "@app/lib/form-field-limits";
import { optionalPhoneSchema } from "@app/lib/phone";

export const AdminFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(
      ENTITY_NAME_MIN_LENGTH,
      `First name must be at least ${ENTITY_NAME_MIN_LENGTH} characters`,
    )
    .max(
      ENTITY_NAME_MAX_LENGTH,
      `First name must be at most ${ENTITY_NAME_MAX_LENGTH} characters`,
    ),
  lastName: z
    .string()
    .trim()
    .min(
      ENTITY_NAME_MIN_LENGTH,
      `Last name must be at least ${ENTITY_NAME_MIN_LENGTH} characters`,
    )
    .max(
      ENTITY_NAME_MAX_LENGTH,
      `Last name must be at most ${ENTITY_NAME_MAX_LENGTH} characters`,
    ),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: optionalPhoneSchema,
  status: z.enum(["ACTIVE", "BLOCKED", "PENDING", "UNCONFIRMED"], {
    errorMap: () => ({ message: "Please select a status" }),
  }),

  adminImage: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),
  age: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) =>
      typeof val === "string" ? (val ? parseInt(val, 10) : undefined) : val,
    ),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),

  country: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  completeAddress: z.string().nullable().optional(),
  perms: z.array(z.string()).optional(),
});