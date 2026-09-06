import { useMemo } from "react";

import {
  updateClinicApi,
  UpdateClinicResponse,
  updateSpecialistApi,
  UpdateSpecialistResponse,
} from "@cosmediate/api";
import { Clinic, Specialist } from "@cosmediate/type-utils";

import { useSpecialistEntity } from "@app/hooks/useSpecialistEntity";
import { useClinicEntity } from "@app/hooks/useClinicEntity";
import { useWorkspace } from "@app/context/WorkspaceContext";
import { useAuth } from "@cosmediate/auth/index";

import { SPECIALIST_ALLOWED_FIELDS } from "../constants/specialist.constants";
import { CLINIC_ALLOWED_FIELDS } from "../constants/clinic.constants";

interface UseClinicSetupData {
  isLoading: boolean;
  initialData: Clinic | Specialist | null;
  allowedFields: Set<string>;
  refetch: () => Promise<void>;
  handleUpdate: (
    data: FormData,
    token: string,
  ) => Promise<UpdateSpecialistResponse | UpdateClinicResponse>;
}

export const useClinicSetup = (): UseClinicSetupData => {
  const { activeClinicId, activeSpecialistId } = useWorkspace();
  const { userRole } = useAuth();

  const {
    clinic,
    isLoading: isClinicLoading,
    refetch: refetchClinic,
  } = useClinicEntity(activeClinicId);
  const {
    specialist,
    isLoading: isSpecialistLoading,
    refetch: refetchSpecialist,
  } = useSpecialistEntity(activeSpecialistId);

  const isLoading =
    userRole === "SPECIALIST" ? isSpecialistLoading : isClinicLoading;

  const initialData = useMemo(
    () => (userRole === "SPECIALIST" ? specialist : clinic),
    [userRole, specialist, clinic],
  );

  const refetch = useMemo(
    () => (userRole === "SPECIALIST" ? refetchSpecialist : refetchClinic),
    [userRole, refetchSpecialist, refetchClinic],
  );

  const handleUpdate = useMemo(
    () => (userRole === "SPECIALIST" ? updateSpecialistApi : updateClinicApi),
    [userRole],
  );

  const allowedFields = useMemo(
    () =>
      userRole === "SPECIALIST"
        ? SPECIALIST_ALLOWED_FIELDS
        : CLINIC_ALLOWED_FIELDS,
    [userRole],
  );

  return {
    isLoading,
    initialData,
    handleUpdate,
    allowedFields,
    refetch,
  };
};
