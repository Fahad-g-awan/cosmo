import { z } from "zod";

const severityEnum = z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"], {
  errorMap: () => ({ message: "Please select a severity" }),
});

const statusEnum = z.enum(["DRAFT", "ACTIVE", "EXPIRED"], {
  errorMap: () => ({ message: "Please select a status" }),
});

const optionalPriority = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}, z.coerce.number().int().min(0).max(1000).optional());

/**
 * Announcement form — required delivery fields; optional schedule/action;
 * actionLabel ↔ actionUrl must both be set or both empty.
 */
export const AnnouncementFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    message: z.string().trim().min(1, "Message is required"),
    severity: severityEnum,
    status: statusEnum,
    priority: optionalPriority,
    startsAt: z.string().optional().nullable(),
    endsAt: z.string().optional().nullable(),
    dismissible: z.boolean(),
    targetRoles: z
      .array(z.enum(["ADMIN", "MANAGER", "SPECIALIST", "PATIENT"]))
      .min(1, "Select at least one target role"),
    targetSurfaces: z
      .array(z.enum(["dashboard", "web", "blog"]))
      .min(1, "Select at least one target surface"),
    actionLabel: z.string().optional().nullable(),
    actionUrl: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const label = data.actionLabel?.trim() ?? "";
    const url = data.actionUrl?.trim() ?? "";

    if (label && !url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action URL is required when action label is set",
        path: ["actionUrl"],
      });
    }

    if (url && !label) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action label is required when action URL is set",
        path: ["actionLabel"],
      });
    }
  });
