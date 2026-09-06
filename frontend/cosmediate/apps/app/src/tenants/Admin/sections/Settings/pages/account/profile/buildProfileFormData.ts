import { buildClearableProfileFormData } from "@app/lib/profile-form";

import { ALLOWED_FIELDS } from "./profile.constants";
import { ProfileFormValues } from "./profile.types";

export function buildAdminProfileFormData(
  data: Partial<ProfileFormValues>,
  extra: Record<string, unknown> = {},
): FormData {
  return buildClearableProfileFormData(
    data as Record<string, unknown>,
    ALLOWED_FIELDS,
    extra,
  );
}
