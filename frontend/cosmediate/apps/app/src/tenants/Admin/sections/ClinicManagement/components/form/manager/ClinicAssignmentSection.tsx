import { useMemo } from "react";

import type { ClinicManager } from "@cosmediate/type-utils/auth";
import { FormSection } from "@cosmediate/form-ui";
import { useAuth } from "@cosmediate/auth";

import {
  ControlledPaginatedAsyncSelectField,
  type PaginatedAsyncOption,
} from "@app/modules/PaginatedAsyncSelect";
import {
  useClinicDomainFormFetcher,
  useClinicFormFetcher,
} from "@app/lib/filters";

type LinkedClinic = NonNullable<ClinicManager["clinics"]>[number];

type ClinicAssignmentSectionProps = {
  isUpdate?: boolean;
  clinicSeed?: PaginatedAsyncOption[];
  /** Linked clinics from the manager — used to resolve parent-org domain scope on update. */
  linkedClinics?: LinkedClinic[];
};

/**
 * Resolve parent org root from linked clinics (PARENT id, else a NODE's parentClinicId).
 */
export const resolveManagerOrgRootId = (
  clinics?: LinkedClinic[] | null,
): string | null => {
  if (!clinics?.length) return null;

  const parent = clinics.find((clinic) => clinic?.clinicType === "PARENT");
  if (parent?.id) return parent.id;

  const nodeWithParent = clinics.find((clinic) => clinic?.parentClinicId);
  return nodeWithParent?.parentClinicId ?? null;
};

export const ClinicAssignmentSection = ({
  isUpdate = false,
  clinicSeed,
  linkedClinics,
}: ClinicAssignmentSectionProps) => {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const orgRootClinicId = useMemo(
    () => (isUpdate ? resolveManagerOrgRootId(linkedClinics) : null),
    [isUpdate, linkedClinics],
  );

  const fetchAllClinics = useClinicFormFetcher();
  const fetchDomainClinics = useClinicDomainFormFetcher(orgRootClinicId);
  const fetchClinics = isUpdate ? fetchDomainClinics : fetchAllClinics;

  const seedOptions = useMemo(
    () => (clinicSeed?.length ? clinicSeed : undefined),
    [clinicSeed],
  );

  if (!isUpdate) {
    return (
      <FormSection title="Clinic Assignment">
        <ControlledPaginatedAsyncSelectField
          path="clinicId"
          label="Clinic"
          placeholder="Select clinic"
          searchPlaceholder="Search clinics..."
          fetchPage={fetchClinics}
          reloadKey={accessToken ?? "no-token"}
          enabled={Boolean(accessToken)}
          disabled={!accessToken}
          seedOptions={seedOptions}
          required
          clearable={false}
        />
        <p className="text-xs text-500">
          Assign this manager to exactly one clinic. Additional clinics in the
          same organization can be linked later.
        </p>
      </FormSection>
    );
  }

  return (
    <FormSection title="Clinic Assignment">
      <ControlledPaginatedAsyncSelectField
        path="clinicIds"
        label="Clinics"
        placeholder="Select clinics"
        searchPlaceholder={
          orgRootClinicId
            ? "Search clinics in this organization..."
            : "Search clinics..."
        }
        fetchPage={fetchClinics}
        reloadKey={`${accessToken ?? "no-token"}:${orgRootClinicId ?? "all"}`}
        enabled={Boolean(accessToken)}
        disabled={!accessToken}
        seedOptions={seedOptions}
        multiple
        required
      />
      <p className="text-xs text-500">
        {orgRootClinicId
          ? "Select one or more clinics in this manager's organization."
          : "Select one or more clinics. All selected clinics must belong to the same organization."}
      </p>
    </FormSection>
  );
};
