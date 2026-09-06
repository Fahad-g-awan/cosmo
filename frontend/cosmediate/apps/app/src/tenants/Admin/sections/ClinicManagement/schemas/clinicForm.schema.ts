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
import {
  isValidE164Phone,
  optionalPhoneSchema,
  PHONE_INVALID_MESSAGE,
} from "@app/lib/phone";

import {
  validateCertificates,
  validateFaqs,
  validateWorkingHours,
} from "../lib/clinic-section-validation";

const newManagerSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    status: z
      .enum(["ACTIVE", "BLOCKED", "PENDING", "UNCONFIRMED"])
      .optional(),
    phone: optionalPhoneSchema,
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional(),
    age: z.number().nullable().optional(),
    country: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    completeAddress: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    perms: z.array(z.string()).optional(),
  })
  .nullable()
  .optional();

/** Shape-only schema (no cross-field refinements). Used for types + base parse. */
export const ClinicFormObjectSchema = z.object({
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

  managerIds: z.array(z.string()).nullable().optional(),
  newManager: newManagerSchema,

  htmlAbout: z.any().optional() as z.ZodType<JSONContentType | undefined>,
  workingHours: z.any().optional() as z.ZodType<WorkingHours | undefined>,
  faqs: z.array(z.any()).nullable().optional() as z.ZodType<
    FAQs[] | null | undefined
  >,
  certificates: z.array(z.any()).nullable().optional() as z.ZodType<
    Certificates[] | null | undefined
  >,
});

type ClinicFormData = z.infer<typeof ClinicFormObjectSchema>;

function addSharedConditionalIssues(
  data: Partial<ClinicFormData> & Record<string, unknown>,
  ctx: z.RefinementCtx,
) {
  if (
    data.clinicType === "NODE" &&
    !(typeof data.parentClinicId === "string" && data.parentClinicId.trim())
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a parent clinic",
      path: ["parentClinicId"],
    });
  }

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

function addInlineManagerIssues(
  manager:
    | {
        firstName?: string;
        lastName?: string;
        email?: string;
        status?: string;
        phone?: string | null;
      }
    | null
    | undefined,
  ctx: z.RefinementCtx,
) {
  if (!manager?.firstName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `First name must be at least ${ENTITY_NAME_MIN_LENGTH} characters`,
      path: ["newManager", "firstName"],
    });
  } else if (manager.firstName.trim().length < ENTITY_NAME_MIN_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `First name must be at least ${ENTITY_NAME_MIN_LENGTH} characters`,
      path: ["newManager", "firstName"],
    });
  }

  if (!manager?.lastName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Last name must be at least ${ENTITY_NAME_MIN_LENGTH} characters`,
      path: ["newManager", "lastName"],
    });
  } else if (manager.lastName.trim().length < ENTITY_NAME_MIN_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Last name must be at least ${ENTITY_NAME_MIN_LENGTH} characters`,
      path: ["newManager", "lastName"],
    });
  }

  if (!manager?.email?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Email is required",
      path: ["newManager", "email"],
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manager.email.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter a valid email address",
      path: ["newManager", "email"],
    });
  }

  if (!manager?.status) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Status is required",
      path: ["newManager", "status"],
    });
  }

  if (manager?.phone?.trim() && !isValidE164Phone(manager.phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: PHONE_INVALID_MESSAGE,
      path: ["newManager", "phone"],
    });
  }
}

function addCreateManagerIssues(
  data: Partial<ClinicFormData> & Record<string, unknown>,
  ctx: z.RefinementCtx,
) {
  if (!data.clinicType) return;
  if (Array.isArray(data.managerIds) && data.managerIds.length > 0) return;

  if (data.clinicType === "PARENT") {
    addInlineManagerIssues(
      data.newManager as Parameters<typeof addInlineManagerIssues>[0],
      ctx,
    );
    return;
  }

  // NODE: only require managers after a parent clinic is chosen (UI hides select until then).
  if (
    !(typeof data.parentClinicId === "string" && data.parentClinicId.trim())
  ) {
    return;
  }

  // Inline create mode is signaled by a non-null newManager object (including {}).
  if (data.newManager != null) {
    addInlineManagerIssues(
      data.newManager as Parameters<typeof addInlineManagerIssues>[0],
      ctx,
    );
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Please select at least one manager",
    path: ["managerIds"],
  });
}

function addUpdateManagerIssues(
  data: Partial<ClinicFormData> & Record<string, unknown>,
  ctx: z.RefinementCtx,
) {
  if (!Array.isArray(data.managerIds) || data.managerIds.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select at least one manager",
      path: ["managerIds"],
    });
  }
}

/**
 * Zod skips `.superRefine()` when the object shape fails.
 * Wrap with `z.any()` so parent/manager/section errors still surface alongside
 * name/email/type errors on an empty or partially filled create form.
 */
function buildClinicFormSchema(
  mode: "create" | "update" | "base",
): z.ZodType<ClinicFormData> {
  return z.any().superRefine((raw, ctx) => {
    const data =
      raw && typeof raw === "object"
        ? (raw as Partial<ClinicFormData> & Record<string, unknown>)
        : ({} as Partial<ClinicFormData> & Record<string, unknown>);

    const shapeResult = ClinicFormObjectSchema.safeParse(data);
    if (!shapeResult.success) {
      for (const issue of shapeResult.error.issues) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: issue.path,
        });
      }
    }

    addSharedConditionalIssues(data, ctx);

    if (mode === "create") {
      addCreateManagerIssues(data, ctx);
    } else if (mode === "update") {
      addUpdateManagerIssues(data, ctx);
    }
  }) as z.ZodType<ClinicFormData>;
}

/** Base schema (shape + shared conditionals). Prefer create/update schemas for forms. */
export const ClinicFormSchema = buildClinicFormSchema("base");

export const ClinicCreateFormSchema = buildClinicFormSchema("create");

export const ClinicUpdateFormSchema = buildClinicFormSchema("update");
