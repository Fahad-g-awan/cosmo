import { z } from "zod";

const hasResultImage = (value: unknown): value is File | string => {
  if (value instanceof File) return true;
  return typeof value === "string" && value.trim().length > 0;
};

/** Max length aligned with backend String primitive. */
export const RESULT_DESCRIPTION_MAX_LENGTH = 500;

export const TreatmentResultFormSchema = z.object({
  treatmentId: z.string().min(1, "Treatment is required"),
  beforeImage: z.custom<File | string>(
    (value) => hasResultImage(value),
    "Before image is required",
  ),
  afterImage: z.custom<File | string>(
    (value) => hasResultImage(value),
    "After image is required",
  ),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(
      RESULT_DESCRIPTION_MAX_LENGTH,
      `Description must be at most ${RESULT_DESCRIPTION_MAX_LENGTH} characters`,
    ),
});
