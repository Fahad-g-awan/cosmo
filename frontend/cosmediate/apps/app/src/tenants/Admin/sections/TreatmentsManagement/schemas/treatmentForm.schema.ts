import { z } from "zod";
import type { FAQs, JSONContentType } from "@cosmediate/type-utils/shared";

import { isRichTextFilled } from "@app/lib/rich-text";
import {
  ENTITY_NAME_MAX_LENGTH,
  ENTITY_NAME_MIN_LENGTH,
  OVERVIEW_MAX_LENGTH,
  OVERVIEW_MIN_LENGTH,
} from "@app/lib/form-field-limits";
import { validateFaqs } from "@app/tenants/Admin/sections/ClinicManagement/lib/clinic-section-validation";

const hasTreatmentImage = (value: unknown): value is File | string => {
  if (value instanceof File) return true;
  return typeof value === "string" && value.trim().length > 0;
};

const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.custom<JSONContentType>(
    (value) => isRichTextFilled(value),
    "Answer is required",
  ),
});

export const TreatmentFormObjectSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z
    .string()
    .trim()
    .min(
      ENTITY_NAME_MIN_LENGTH,
      `Treatment name must be at least ${ENTITY_NAME_MIN_LENGTH} characters`,
    )
    .max(
      ENTITY_NAME_MAX_LENGTH,
      `Treatment name must be at most ${ENTITY_NAME_MAX_LENGTH} characters`,
    ),
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
  published: z.boolean({
    required_error: "Published status is required",
  }),
  recoveryTime: z.string().trim().min(1, "Recovery time is required"),
  anesthesia: z
    .string()
    .trim()
    .min(1, "Anesthesia requirement is required"),
  htmlDescription: z.custom<JSONContentType>(
    (value) => isRichTextFilled(value),
    "Content is required",
  ),
  faqs: z
    .array(faqSchema)
    .min(1, "At least one FAQ is required") as z.ZodType<FAQs[]>,
  tags: z
    .array(z.string().trim().min(1, "Tag cannot be empty"))
    .min(1, "At least one tag is required"),
  treatmentImage: z.custom<File | string>(
    (value) => hasTreatmentImage(value),
    "Treatment image is required",
  ),
});

export const TreatmentFormSchema = TreatmentFormObjectSchema.superRefine(
  (data, ctx) => {
    const faqErrors = validateFaqs(data.faqs as FAQs[] | null | undefined);
    for (const error of faqErrors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error.message,
        path: ["faqs", error.index, error.field],
      });
    }
  },
);
