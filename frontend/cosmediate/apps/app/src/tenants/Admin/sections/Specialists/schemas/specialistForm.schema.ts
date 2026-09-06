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
} from "../../ClinicManagement/lib/clinic-section-validation";

/** Shape-only schema (no cross-field refinements). Used for types + base parse. */
export const SpecialistFormObjectSchema = z.object({
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
  workingType: z.enum(["FULL_TIME", "FREELANCE"], {
    errorMap: () => ({ message: "Please select a working type" }),
  }),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  // Optional — blank omitted; invalid format still errors
  phone: optionalPhoneSchema,
  status: z.enum(["ACTIVE", "BLOCKED", "PENDING", "UNCONFIRMED"], {
    errorMap: () => ({ message: "Please select a status" }),
  }),
  available: z.boolean({
    errorMap: () => ({ message: "Please set specialist availability" }),
  }),

  clinicIds: z.array(z.string()).nullable().optional(),
  parentClinicId: z.string().nullable().optional(),

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

  htmlAbout: z.any().optional() as z.ZodType<JSONContentType | undefined>,
  workingHours: z.any().optional() as z.ZodType<WorkingHours | undefined>,
  faqs: z.array(z.any()).nullable().optional() as z.ZodType<
    FAQs[] | null | undefined
  >,
  certificates: z.array(z.any()).nullable().optional() as z.ZodType<
    Certificates[] | null | undefined
  >,
  perms: z.array(z.string()).optional(),
});

export type SpecialistFormData = z.infer<typeof SpecialistFormObjectSchema>;

function addClinicAssignmentIssues(
  data: Partial<SpecialistFormData> & Record<string, unknown>,
  ctx: z.RefinementCtx,
) {
  if (data.workingType === "FULL_TIME") {
    if (
      !(typeof data.parentClinicId === "string" && data.parentClinicId.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a home clinic",
        path: ["parentClinicId"],
      });
    }
    return;
  }

  if (data.workingType === "FREELANCE") {
    if (!Array.isArray(data.clinicIds) || data.clinicIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select at least one clinic",
        path: ["clinicIds"],
      });
    }
  }
}

function addSectionIssues(
  data: Partial<SpecialistFormData> & Record<string, unknown>,
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

/**
 * Zod skips `.superRefine()` when the object shape fails.
 * Wrap with `z.any()` so clinic-assignment / section errors still surface
 * alongside name/email/type errors on an empty create form.
 */
export const SpecialistFormSchema = z.any().superRefine((raw, ctx) => {
  const data =
    raw && typeof raw === "object"
      ? (raw as Partial<SpecialistFormData> & Record<string, unknown>)
      : ({} as Partial<SpecialistFormData> & Record<string, unknown>);

  const shapeResult = SpecialistFormObjectSchema.safeParse(data);
  if (!shapeResult.success) {
    for (const issue of shapeResult.error.issues) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: issue.message,
        path: issue.path,
      });
    }
  }

  addClinicAssignmentIssues(data, ctx);
  addSectionIssues(data, ctx);
}) as z.ZodType<SpecialistFormData>;
