import { useMemo } from "react";

import type { Clinic } from "@cosmediate/type-utils/clinic";
import { getManagementClinicsApi } from "@cosmediate/api";
import { FormSection } from "@cosmediate/form-ui";
import { useAuth } from "@cosmediate/auth";

import {
  ControlledPaginatedAsyncSelectField,
  createManagementListFetcher,
  PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
  type PaginatedAsyncOption,
} from "@app/modules/PaginatedAsyncSelect";

type ParentClinicSectionProps = {
  parentClinicSeed?: PaginatedAsyncOption[];
};

export const ParentClinicSection = ({
  parentClinicSeed,
}: ParentClinicSectionProps) => {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const fetchParentClinics = useMemo(
    () =>
      createManagementListFetcher<Clinic>({
        fetchList: getManagementClinicsApi,
        accessToken,
        pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
        filters: { clinicType: "PARENT" },
        mapOption: (clinic) => ({
          value: clinic.id,
          label: `${clinic.name}${clinic.completeAddress ? ` - ${clinic.completeAddress}` : ""}`,
          searchText: `${clinic.name} ${clinic.completeAddress ?? ""} ${clinic.city ?? ""}`,
        }),
      }),
    [accessToken],
  );

  const seedOptions = useMemo(
    () => (parentClinicSeed?.length ? parentClinicSeed : undefined),
    [parentClinicSeed],
  );

  return (
    <FormSection title="Parent Clinic">
      <ControlledPaginatedAsyncSelectField
        path="parentClinicId"
        label="Parent clinic"
        placeholder="Select parent clinic"
        searchPlaceholder="Search parent clinics..."
        fetchPage={fetchParentClinics}
        reloadKey={accessToken ?? "no-token"}
        enabled={Boolean(accessToken)}
        disabled={!accessToken}
        seedOptions={seedOptions}
        required
        clearable
      />
    </FormSection>
  );
};
