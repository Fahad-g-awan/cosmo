import { z } from "zod";

import { profileIdentityFields } from "@app/lib/profile-form";

export const ProfileFormSchema = z.object({
  managerImage: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),
  specialistImage: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),
  ...profileIdentityFields,
  perms: z.array(z.string()).optional(),
});
