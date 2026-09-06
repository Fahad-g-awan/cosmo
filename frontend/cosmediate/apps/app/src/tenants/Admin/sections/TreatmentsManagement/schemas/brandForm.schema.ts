import { z } from "zod";

import {
  BRAND_NAME_MAX_LENGTH,
  BRAND_NAME_MIN_LENGTH,
} from "../constants/brand.constants";

/**
 * Zod schema for BrandForm (unified for single & multiple modes).
 * Issues are attached to `names` (not `names.0`) so NameSection / NamesSection
 * FieldError paths match.
 */
export const BrandFormSchema = z.object({
  names: z
    .array(z.string())
    .min(1, "At least one brand name is required")
    .superRefine((names, ctx) => {
      for (const name of names) {
        const trimmed = name.trim();

        if (!trimmed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Brand name cannot be empty",
            path: [],
          });
          return;
        }

        if (trimmed.length < BRAND_NAME_MIN_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Brand name must be at least ${BRAND_NAME_MIN_LENGTH} characters`,
            path: [],
          });
          return;
        }

        if (trimmed.length > BRAND_NAME_MAX_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Brand name must be at most ${BRAND_NAME_MAX_LENGTH} characters`,
            path: [],
          });
          return;
        }
      }
    }),
  published: z.boolean(),
});
