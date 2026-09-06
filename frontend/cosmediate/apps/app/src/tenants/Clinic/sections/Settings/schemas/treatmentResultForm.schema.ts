import { z } from "zod";

export const TreatmentResultFormSchema = z
  .object({
    clinicTreatmentId: z.string().optional(),
    treatmentId: z.string().optional(),
    beforeImage: z
      .union([z.instanceof(File), z.string()])
      .nullable()
      .optional(),
    afterImage: z
      .union([z.instanceof(File), z.string()])
      .nullable()
      .optional(),
    description: z.string().min(1, "Description is required"),
  })
  .superRefine((data, ctx) => {
    if (!data.clinicTreatmentId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["clinicTreatmentId"],
        message: "Clinic treatment offering is required",
      });
    }
  });
