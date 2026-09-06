import { z } from "zod";

import {
  ENTITY_NAME_MAX_LENGTH,
  ENTITY_NAME_MIN_LENGTH,
} from "@app/lib/form-field-limits";
import { normalizePhone, optionalPhoneSchema } from "@app/lib/phone";

/**
 * Shared Settings Profile identity fields — matches Admin Patient/Admin/Manager CRUD:
 * firstName + lastName required; email required (UI disables edit); phone + rest optional.
 */
export const profileIdentityFields = {
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
  age: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val == null || val === "") return undefined;
      const parsed = typeof val === "string" ? parseInt(val, 10) : val;
      return typeof parsed === "number" && Number.isNaN(parsed)
        ? undefined
        : parsed;
    }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  completeAddress: z.string().optional().nullable(),
};

/** Map BE AJV paths → Settings Profile form paths (identity + image aliases). */
export const PROFILE_IDENTITY_FIELD_MAP: Record<string, string> = {
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  phone: "phone",
  age: "age",
  gender: "gender",
  country: "country",
  state: "state",
  city: "city",
  postalCode: "postalCode",
  completeAddress: "completeAddress",
};

const IMAGE_FIELD_RE = /Image$/i;

/**
 * Build FormData for profile/self updates.
 * Optional empty fields are sent as "" so the backend can clear them in DB.
 * Required fields (firstName, lastName, email) are still omitted when blank
 * so Zod + AJV required checks stay authoritative.
 */
export function buildClearableProfileFormData(
  data: Record<string, unknown>,
  allowedFields: Set<string>,
  extra: Record<string, unknown> = {},
): FormData {
  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (!allowedFields.has(key)) return;

    if (key === "phone") {
      requestData.phone = normalizePhone(value) ?? "";
      return;
    }

    if (IMAGE_FIELD_RE.test(key)) {
      if (value instanceof File) {
        requestData[key] = value;
      } else if (typeof value === "string" && value.trim()) {
        requestData[key] = value.trim();
      } else {
        requestData[key] = "";
      }
      return;
    }

    if (key === "firstName" || key === "lastName" || key === "email") {
      if (value === undefined || value === null || value === "") return;
      requestData[key] = value;
      return;
    }

    if (value === undefined || value === null) {
      requestData[key] = "";
      return;
    }

    if (typeof value === "string" && value.trim() === "") {
      requestData[key] = "";
      return;
    }

    requestData[key] = value;
  });

  const formData = new FormData();

  Object.entries(requestData).forEach(([key, value]) => {
    if (value === undefined) return;

    if (value === null) {
      formData.append(key, "");
      return;
    }

    if (typeof value === "object" && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "string" || value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}
