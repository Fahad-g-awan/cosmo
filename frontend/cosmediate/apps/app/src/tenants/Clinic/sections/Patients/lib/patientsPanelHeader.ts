import type { UserRole } from "@cosmediate/type-utils";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";

type PatientsPanelKey = "main" | "record" | "add" | "update";

/** Clinic pages are shared with specialists via RoleSwitcher. */
export function getPatientsPanelHeader(
  role: UserRole | string | null | undefined,
  key: PatientsPanelKey,
) {
  if (role === "SPECIALIST") {
    return panelHeaderConfig.specialist.patients[key];
  }
  return panelHeaderConfig.clinic.patients[key];
}
