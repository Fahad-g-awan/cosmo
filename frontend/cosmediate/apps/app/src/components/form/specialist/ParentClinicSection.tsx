import { useMemo } from "react";

import { FormSection } from "@cosmediate/form-ui";
import { InfoMessage } from "@cosmediate/ui";
import { useAuth } from "@cosmediate/auth";
import { useFormValue } from "@cosmediate/form-core";

import {
  ControlledPaginatedAsyncSelectField,
  type PaginatedAsyncOption,
} from "@app/modules/PaginatedAsyncSelect";
import {
  useClinicFormFetcher,
  useClinicOrgFormFetcher,
} from "@app/lib/filters";

type ParentClinicSectionProps = {
  clinicSeed?: PaginatedAsyncOption[];
  isUpdate?: boolean;
  clinicDashboard?: boolean;
};

const FullTimeClinicAssignmentNote = ({
  isUpdate,
  clinicDashboard = false,
}: {
  isUpdate: boolean;
  clinicDashboard?: boolean;
}) => {
  if (clinicDashboard) {
    return (
      <InfoMessage
        title={
          isUpdate ? "Transfer within your organization" : "Full-time at your active clinic"
        }
        message={
          isUpdate
            ? "You can move this specialist to another clinic in your organization. Their treatment selections at the current clinic will be deactivated, they will no longer appear in that clinic's specialist list, and active offerings are copied to the new clinic."
            : "This specialist will be linked to the clinic currently selected in your dashboard switcher."
        }
        variant="info"
        size="sm"
      />
    );
  }

  return (
    <InfoMessage
      title={isUpdate ? "Transferring home clinic" : "Home clinic assignment"}
      message={
        isUpdate
          ? "Changing the home clinic deactivates this specialist's treatment selections at the current clinic and removes them from that clinic's specialist list. Active offerings are copied to the new home clinic."
          : "If the home clinic is changed later, treatment selections at the previous clinic are deactivated, the specialist no longer appears in that clinic's list, and active offerings are copied to the new clinic."
      }
      variant="info"
      size="sm"
    />
  );
};

const FreelanceClinicAssignmentNote = ({
  clinicDashboard = false,
}: {
  clinicDashboard?: boolean;
}) => (
  <InfoMessage
    title="Freelance clinic assignments"
    message={
      clinicDashboard
        ? "Freelance specialists are managed by platform admin. When clinic assignments change, treatment selections at removed clinics are deactivated and the specialist no longer appears in those clinic lists. New clinics receive a copy of their active offerings."
        : "Removing a clinic from this list deactivates the specialist's treatment selections at that clinic and removes them from that clinic's specialist list. Adding a clinic copies their active treatment selections there."
    }
    variant="info"
    size="sm"
  />
);

export const ParentClinicSection = ({
  clinicSeed,
  isUpdate = false,
  clinicDashboard = false,
}: ParentClinicSectionProps) => {
  const { session, sessionUser } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const fetchAllClinics = useClinicFormFetcher();
  const orgClinicIds = sessionUser?.scope?.clinicIds ?? [];
  const fetchOrgClinics = useClinicOrgFormFetcher(orgClinicIds);
  const workingType = useFormValue<string>("workingType");

  const seedOptions = useMemo(
    () => (clinicSeed?.length ? clinicSeed : undefined),
    [clinicSeed],
  );

  if (clinicDashboard && !isUpdate) {
    return (
      <FormSection title="Clinic Assignment">
        <FullTimeClinicAssignmentNote
          isUpdate={false}
          clinicDashboard={clinicDashboard}
        />
      </FormSection>
    );
  }

  if (clinicDashboard && isUpdate) {
    return (
      <FormSection title="Clinic Assignment">
        <div className="space-y-3">
          <ControlledPaginatedAsyncSelectField
            path="parentClinicId"
            label="Home clinic"
            placeholder="Select home clinic"
            searchPlaceholder="Search clinics in your organization..."
            fetchPage={fetchOrgClinics}
            reloadKey={`${accessToken ?? "no-token"}:${orgClinicIds.join(",")}`}
            enabled={Boolean(accessToken) && orgClinicIds.length > 0}
            disabled={!accessToken || orgClinicIds.length === 0}
            seedOptions={seedOptions}
            required
            clearable={false}
          />
          <FullTimeClinicAssignmentNote
            isUpdate={isUpdate}
            clinicDashboard={clinicDashboard}
          />
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection title="Clinic Assignment">
      {!workingType && (
        <InfoMessage
          title="Please select working type"
          message="Clinic selection depends on specialist working type"
          variant="info"
          size="sm"
        />
      )}

      {workingType === "FULL_TIME" && (
        <div className="space-y-3">
          <ControlledPaginatedAsyncSelectField
            path="parentClinicId"
            label="Home clinic"
            placeholder="Select home clinic"
            searchPlaceholder="Search clinics..."
            fetchPage={fetchAllClinics}
            reloadKey={accessToken ?? "no-token"}
            enabled={Boolean(accessToken)}
            disabled={!accessToken}
            seedOptions={seedOptions}
            required
            clearable
          />
          <FullTimeClinicAssignmentNote
            isUpdate={isUpdate}
            clinicDashboard={clinicDashboard}
          />
        </div>
      )}

      {workingType === "FREELANCE" && (
        <div className="space-y-3">
          <ControlledPaginatedAsyncSelectField
            path="clinicIds"
            label="Clinics"
            placeholder="Select clinics"
            searchPlaceholder="Search clinics..."
            fetchPage={fetchAllClinics}
            reloadKey={accessToken ?? "no-token"}
            enabled={Boolean(accessToken)}
            disabled={!accessToken}
            seedOptions={seedOptions}
            multiple
            required
          />
          <FreelanceClinicAssignmentNote clinicDashboard={clinicDashboard} />
        </div>
      )}
    </FormSection>
  );
};
