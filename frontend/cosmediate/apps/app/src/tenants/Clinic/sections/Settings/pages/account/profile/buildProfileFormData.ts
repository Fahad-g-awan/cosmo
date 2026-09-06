import type { Specialist } from "@cosmediate/type-utils";
import type { ClinicManager } from "@cosmediate/type-utils/auth";

import { buildClearableProfileFormData } from "@app/lib/profile-form";

import {
  getAllowedFields,
  type AccountProfileRole,
} from "./profile.constants";
import { ProfileFormValues } from "./profile.types";

type AccountProfileEntity = ClinicManager | Specialist;

/**
 * Build FormData for manager/specialist self-profile update.
 * Specialist AJV requires workingType + available (+ clinic assignment) on every update —
 * those are seeded from the loaded entity, not the settings form.
 * Empty optional form fields are sent so the backend can clear them.
 */
export function buildAccountProfileFormData(
  profileId: string,
  data: Partial<ProfileFormValues>,
  role: AccountProfileRole,
  entity: AccountProfileEntity | null,
): FormData {
  const extra: Record<string, unknown> = {
    id: profileId,
    status: entity?.status,
  };

  if (role === "SPECIALIST" && entity) {
    const specialist = entity as Specialist;
    extra.workingType = specialist.workingType;
    extra.available = specialist.available ?? true;

    if (specialist.workingType === "FULL_TIME" && specialist.parentClinicId) {
      extra.parentClinicId = specialist.parentClinicId;
    }
    if (
      specialist.workingType === "FREELANCE" &&
      specialist.clinicIds?.length
    ) {
      extra.clinicIds = specialist.clinicIds;
    }
  }

  return buildClearableProfileFormData(
    data as Record<string, unknown>,
    getAllowedFields(role),
    extra,
  );
}
