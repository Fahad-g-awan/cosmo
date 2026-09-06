import { z } from "zod";

import { profileIdentityFields } from "@app/lib/profile-form";

export const ProfileFormSchema = z.object({
  adminImage: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),
  ...profileIdentityFields,
  perms: z.array(z.string()).optional(),
});
