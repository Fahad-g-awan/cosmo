import { z } from "zod";

import {
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
} from "../constants/clinicCategory.constants";

/**
 * Zod schema for CategoryForm (unified for single & multiple modes).
 * Issues are attached to `names` (not `names.0`) so NameSection / NamesSection
 * FieldError paths match.
 */
export const CategoryFormSchema = z.object({
  names: z
    .array(z.string())
    .min(1, "At least one category name is required")
    .superRefine((names, ctx) => {
      for (const name of names) {
        const trimmed = name.trim();

        if (!trimmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Category name cannot be empty",
            path: [],
          });
          return;
        }

        if (trimmed.length < CATEGORY_NAME_MIN_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Category name must be at least ${CATEGORY_NAME_MIN_LENGTH} characters`,
            path: [],
          });
          return;
        }

        if (trimmed.length > CATEGORY_NAME_MAX_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Category name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`,
            path: [],
          });
          return;
        }
      }
    }),
  published: z.boolean(),
});
