import { z } from "zod";
import type {
  JSONContentType,
  WorkingHours,
  FAQs,
  Certificates,
} from "@cosmediate/type-utils/shared";

import {
  ENTITY_NAME_MAX_LENGTH,
  ENTITY_NAME_MIN_LENGTH,
  OVERVIEW_MAX_LENGTH,
  OVERVIEW_MIN_LENGTH,
} from "@app/lib/form-field-limits";
import { optionalPhoneSchema } from "@app/lib/phone";
import {
  validateCertificates,
  validateFaqs,
  validateWorkingHours,
} from "@app/tenants/Admin/sections/ClinicManagement/lib/clinic-section-validation";

/** Clinic dashboard setup — aligned with Admin clinic update (no manager assignment). */
export const ClinicSetupFormObjectSchema = z.object({
  clinicType: z.enum(["PARENT", "NODE"], {
    errorMap: () => ({ message: "Please select a clinic type" }),
  }),
  name: z
    .string()
    .trim()
    .min(
      ENTITY_NAME_MIN_LENGTH,
      `Clinic name must be at least ${ENTITY_NAME_MIN_LENGTH} characters`,
    )
    .max(
      ENTITY_NAME_MAX_LENGTH,
      `Clinic name must be at most ${ENTITY_NAME_MAX_LENGTH} characters`,
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
  available: z.boolean({
    errorMap: () => ({ message: "Please set clinic availability" }),
  }),

  clinicLogo: z
    .union([z.string(), z.instanceof(File)])
    .optional()
    .nullable(),
  clinicImages: z
    .array(z.union([z.string(), z.instanceof(File)]))
    .optional()
    .nullable(),

  clinicAge: z.string().nullable().optional(),
  overview: z
    .string()
    .trim()
    .min(
      OVERVIEW_MIN_LENGTH,
      `Overview must be at least ${OVERVIEW_MIN_LENGTH} characters`,
    )
    .max(
      OVERVIEW_MAX_LENGTH,
      `Overview must be at most ${OVERVIEW_MAX_LENGTH} characters`,
    ),
  instagramId: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  completeAddress: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),

  tags: z.array(z.string()).nullable().optional(),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  parentClinicId: z.string().nullable().optional(),

  htmlAbout: z.any().optional() as z.ZodType<JSONContentType | undefined>,
  workingHours: z.any().optional() as z.ZodType<WorkingHours | undefined>,
  faqs: z.array(z.any()).nullable().optional() as z.ZodType<
    FAQs[] | null | undefined
  >,
  certificates: z.array(z.any()).nullable().optional() as z.ZodType<
    Certificates[] | null | undefined
  >,
});

/** Specialist settings → clinic/profile setup tabs (shared shell). */
export const SpecialistSetupFormObjectSchema = z.object({
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
  // Seeded from loaded specialist — not editable in advance profile setup UI
  status: z
    .enum(["ACTIVE", "BLOCKED", "PENDING", "UNCONFIRMED"])
    .optional()
    .nullable(),
  available: z.boolean({
    errorMap: () => ({ message: "Please set availability" }),
  }),
  // Seeded — not editable here (admin-managed)
  workingType: z.enum(["FULL_TIME", "FREELANCE"]).nullable().optional(),
  specialistImage: z
    .union([z.string(), z.instanceof(File)])
    .optional()
    .nullable(),
  age: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val == null || val === "") return undefined;
      if (typeof val === "string") {
        const parsed = parseInt(val, 10);
        return Number.isNaN(parsed) ? undefined : parsed;
      }
      return val;
    }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  totalExperience: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val == null || val === "") return undefined;
      if (typeof val === "string") {
        const parsed = parseInt(val, 10);
        return Number.isNaN(parsed) ? undefined : parsed;
      }
      return val;
    }),
  overview: z
    .string()
    .trim()
    .min(
      OVERVIEW_MIN_LENGTH,
      `Overview must be at least ${OVERVIEW_MIN_LENGTH} characters`,
    )
    .max(
      OVERVIEW_MAX_LENGTH,
      `Overview must be at most ${OVERVIEW_MAX_LENGTH} characters`,
    ),
  instagramId: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  completeAddress: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  clinicIds: z.array(z.string()).optional(),
  parentClinicId: z.string().nullable().optional(),
  htmlAbout: z.any().optional() as z.ZodType<JSONContentType | undefined>,
  workingHours: z.any().optional() as z.ZodType<WorkingHours | undefined>,
  faqs: z.array(z.any()).nullable().optional() as z.ZodType<
    FAQs[] | null | undefined
  >,
  certificates: z.array(z.any()).nullable().optional() as z.ZodType<
    Certificates[] | null | undefined
  >,
});

export type ClinicSetupFormData = z.infer<typeof ClinicSetupFormObjectSchema>;
export type SpecialistSetupFormData = z.infer<
  typeof SpecialistSetupFormObjectSchema
>;

/** Union used by shared ClinicFormValues typing for the setup shell. */
export type ClinicFormData = ClinicSetupFormData &
  Partial<SpecialistSetupFormData>;

function addClinicConditionalIssues(
  data: Partial<ClinicSetupFormData> & Record<string, unknown>,
  ctx: z.RefinementCtx,
) {
  if (
    data.clinicType === "NODE" &&
    !(typeof data.parentClinicId === "string" && data.parentClinicId.trim())
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Parent clinic is required for branch clinics",
      path: ["parentClinicId"],
    });
  }
}

function addSectionIssues(
  data: Record<string, unknown>,
  ctx: z.RefinementCtx,
) {
  const hoursError = validateWorkingHours(
    data.workingHours as WorkingHours | undefined,
  );
  if (hoursError) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: hoursError,
      path: ["workingHours"],
    });
  }

  const certErrors = validateCertificates(
    (data.certificates as Certificates[] | null | undefined) ?? [],
  );
  if (certErrors.length > 0) {
    const byIndex = new Map<number, string[]>();
    for (const error of certErrors) {
      const list = byIndex.get(error.index) ?? [];
      list.push(error.message);
      byIndex.set(error.index, list);
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: [...byIndex.entries()]
        .map(
          ([index, messages]) =>
            `Certificate ${index + 1}: ${messages.join(", ")}`,
        )
        .join(" · "),
      path: ["certificates"],
    });
  }

  const faqErrors = validateFaqs(data.faqs as FAQs[] | null | undefined);
  for (const error of faqErrors) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error.message,
      path: ["faqs", error.index, error.field],
    });
  }
}

function buildSetupSchema(
  shape: z.ZodObject<z.ZodRawShape>,
  includeClinicConditionals: boolean,
) {
  return z.any().superRefine((raw, ctx) => {
    const data =
      raw && typeof raw === "object"
        ? (raw as Record<string, unknown>)
        : {};

    const shapeResult = shape.safeParse(data);
    if (!shapeResult.success) {
      for (const issue of shapeResult.error.issues) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: issue.path,
        });
      }
    }

    if (includeClinicConditionals) {
      addClinicConditionalIssues(
        data as Partial<ClinicSetupFormData> & Record<string, unknown>,
        ctx,
      );
    }

    addSectionIssues(data, ctx);
  });
}

export const ClinicFormSchema = buildSetupSchema(
  ClinicSetupFormObjectSchema,
  true,
) as z.ZodType<ClinicSetupFormData>;

export const SpecialistSetupFormSchema = buildSetupSchema(
  SpecialistSetupFormObjectSchema,
  false,
) as z.ZodType<SpecialistSetupFormData>;

/** Alias for type inference of the shared form values shape. */
export const ClinicFormObjectSchema = ClinicSetupFormObjectSchema;
