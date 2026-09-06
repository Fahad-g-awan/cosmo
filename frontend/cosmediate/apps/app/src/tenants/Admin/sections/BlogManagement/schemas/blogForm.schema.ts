import { z } from "zod";
import type { JSONContentType } from "@cosmediate/type-utils/shared";

import { isRichTextFilled } from "@app/lib/rich-text";
import {
  ENTITY_NAME_MAX_LENGTH,
  ENTITY_NAME_MIN_LENGTH,
  OVERVIEW_MAX_LENGTH,
  OVERVIEW_MIN_LENGTH,
} from "@app/lib/form-field-limits";

const hasBlogImage = (value: unknown): value is File | string => {
  if (value instanceof File) return true;
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Zod schema for BlogForm — all fields required on create and update.
 */
export const BlogFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      ENTITY_NAME_MIN_LENGTH,
      `Title must be at least ${ENTITY_NAME_MIN_LENGTH} characters`,
    )
    .max(
      ENTITY_NAME_MAX_LENGTH,
      `Title must be at most ${ENTITY_NAME_MAX_LENGTH} characters`,
    ),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"], {
    errorMap: () => ({ message: "Please select a status" }),
  }),
  blogImage: z.custom<File | string>(
    (value) => hasBlogImage(value),
    "Blog image is required",
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
  publishedAt: z.string().trim().min(1, "Publish date is required"),
  tags: z
    .array(z.string().trim().min(1, "Tag cannot be empty"))
    .min(1, "At least one tag is required"),
  content: z.custom<JSONContentType>(
    (value) => isRichTextFilled(value),
    "Content is required",
  ),
});
