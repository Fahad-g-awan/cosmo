import type { Clinic, Specialist } from "@cosmediate/type-utils";

import type {
  DashboardReviewEntityInput,
  ResolvedDashboardReviewEntity,
} from "../types";

export const resolveDashboardReviewEntity = ({
  userRole,
  activeClinicId,
  specialistProfileId,
  clinic,
  specialist,
}: DashboardReviewEntityInput): ResolvedDashboardReviewEntity | null => {
  if (userRole === "MANAGER") {
    if (!activeClinicId || !clinic) return null;
    return {
      targetEntityId: activeClinicId,
      targetEntityType: "CLINIC",
      entity: clinic,
      refetchKey: activeClinicId,
      refetchOnClinicSwitch: true,
    };
  }

  if (userRole === "SPECIALIST") {
    const id = specialistProfileId ?? specialist?.id;
    if (!id || !specialist) return null;
    return {
      targetEntityId: id,
      targetEntityType: "SPECIALIST",
      entity: specialist,
      refetchKey: id,
      refetchOnClinicSwitch: false,
    };
  }

  return null;
};

export const resolveEntityType = (
  entity: Clinic | Specialist,
): "CLINIC" | "SPECIALIST" => {
  return entity.entityType?.toLowerCase().includes("clinic")
    ? "CLINIC"
    : "SPECIALIST";
};

export const resolveClinicCount = (
  userRole: string | null,
  activeEntity: Clinic | Specialist | null,
) => {
  if (!userRole || !activeEntity) return 0;

  if (userRole === "SPECIALIST") {
    return (activeEntity as Specialist).workingType === "FULL_TIME"
      ? 1
      : (activeEntity as Specialist)?.clinics?.length || 0;
  }

  return (activeEntity as Clinic).clinicType === "PARENT"
    ? (activeEntity as Clinic)?.clinicCount || 0
    : 1;
};
