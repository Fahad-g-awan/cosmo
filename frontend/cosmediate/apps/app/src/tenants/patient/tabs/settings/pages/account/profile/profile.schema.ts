import { z } from "zod";

import { profileIdentityFields } from "@app/lib/profile-form";

export const ProfileFormSchema = z.object({
  patientImage: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),
  ...profileIdentityFields,
});
