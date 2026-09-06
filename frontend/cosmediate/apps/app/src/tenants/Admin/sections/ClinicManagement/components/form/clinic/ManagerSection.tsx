import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Input, Label, ToggleMenu } from "@cosmediate/ui";
import {
  ControlledSelectField,
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";
import { useFormSetValue, useFormValue } from "@cosmediate/form-core";
import { useAuth } from "@cosmediate/auth";

import {
  ControlledPaginatedAsyncSelectField,
  type PaginatedAsyncOption,
} from "@app/modules/PaginatedAsyncSelect";
import { PermissionsGrantField } from "@app/components/permissions/PermissionsGrantField";
import { normalizePhone, PHONE_FORMAT_HINT } from "@app/lib/phone";
import { useClinicManagersFormFetcher } from "@app/lib/filters";

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

const MANAGER_STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Pending", value: "PENDING" },
  { label: "Unconfirmed", value: "UNCONFIRMED" },
];

export const ManagerSection = ({
  mode = "create",
  clinicId,
  managerSeed,
}: {
  mode?: "create" | "update";
  clinicId?: string;
  managerSeed?: PaginatedAsyncOption[];
}) => {
  const newManager = useFormValue<Record<string, unknown> | null | undefined>(
    "newManager",
  );
  const parentClinicId = useFormValue<string | undefined>("parentClinicId");
  const clinicType = useFormValue<string | undefined>("clinicType");
  const setValue = useFormSetValue();
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const isParentClinic = clinicType === "PARENT";
  const isNodeClinic = clinicType === "NODE";
  const isUpdateMode = mode === "update";

  const [createNewManager, setCreateNewManager] = useState(false);
  const prevClinicTypeRef = useRef<string | undefined>(clinicType);
  const prevParentClinicIdRef = useRef<string | undefined>(parentClinicId);

  const managerClinicId = isParentClinic ? clinicId : parentClinicId;
  const fetchManagers = useClinicManagersFormFetcher(managerClinicId);

  const seedOptions = useMemo(
    () => (managerSeed?.length ? managerSeed : undefined),
    [managerSeed],
  );

  // Reset manager mode only when clinic type actually changes (not after validate).
  useEffect(() => {
    if (isUpdateMode) {
      prevClinicTypeRef.current = clinicType;
      return;
    }

    const prevType = prevClinicTypeRef.current;
    if (prevType === clinicType) return;
    prevClinicTypeRef.current = clinicType;

    if (clinicType === "PARENT") {
      setCreateNewManager(true);
      setValue("managerIds", []);
      setValue("parentClinicId", undefined);
      setValue("newManager", {});
      return;
    }

    if (clinicType === "NODE") {
      setCreateNewManager(false);
      setValue("newManager", undefined);
    }
  }, [clinicType, isUpdateMode, setValue]);

  // Reset selected managers only when the parent clinic value changes.
  useEffect(() => {
    if (isUpdateMode || !isNodeClinic) {
      prevParentClinicIdRef.current = parentClinicId;
      return;
    }

    const prevParent = prevParentClinicIdRef.current;
    if (prevParent === parentClinicId) return;
    prevParentClinicIdRef.current = parentClinicId;

    // Avoid setValue when already empty — setValue clears field errors.
    if (prevParent !== undefined || parentClinicId !== undefined) {
      setValue("managerIds", []);
    }
  }, [parentClinicId, isUpdateMode, isNodeClinic, setValue]);

  const handleNewManagerChange = useCallback(
    (field: string, value: string | number | undefined) => {
      setValue("newManager", {
        ...(newManager && typeof newManager === "object" ? newManager : {}),
        [field]: value,
      });
    },
    [newManager, setValue],
  );

  const handleManagerModeChange = useCallback(
    (value: string) => {
      const createNew = value === "new";
      setCreateNewManager(createNew);
      if (createNew) {
        setValue("managerIds", []);
        setValue("newManager", {});
      } else {
        setValue("newManager", undefined);
      }
    },
    [setValue],
  );

  const renderSelectManager = (title?: string) => (
    <FormSection title={title}>
      <ControlledPaginatedAsyncSelectField
        path="managerIds"
        label="Select manager/s"
        placeholder="Select manager/s"
        searchPlaceholder="Search managers..."
        fetchPage={fetchManagers}
        reloadKey={`${accessToken ?? "no-token"}:${managerClinicId ?? "none"}`}
        enabled={Boolean(accessToken && managerClinicId)}
        disabled={!accessToken || !managerClinicId}
        seedOptions={seedOptions}
        multiple
        required
      />
      <p className="text-xs text-gray-500">
        Only managers linked to the selected parent clinic&apos;s organization
        are shown.
      </p>
    </FormSection>
  );

  if (isUpdateMode) {
    return renderSelectManager("Manager Assignment");
  }

  if (!clinicType) {
    return (
      <FormSection title="Manager Assignment">
        <p className="text-sm text-500 p-4 bg-ghost-blue rounded-xl">
          Please select a clinic type first to assign managers.
        </p>
      </FormSection>
    );
  }

  return (
    <FormSection title="Manager Assignment">
      {isNodeClinic && parentClinicId && (
        <ToggleMenu
          items={[
            { label: "Select Existing Manager/s", value: "existing" },
            { label: "Create New Manager", value: "new" },
          ]}
          value={createNewManager ? "new" : "existing"}
          onChange={handleManagerModeChange}
          className="w-full"
        />
      )}

      {isNodeClinic && !parentClinicId && (
        <p className="text-sm text-500 p-4 bg-ghost-blue rounded-xl">
          Please select a parent clinic first to assign managers.
        </p>
      )}

      {isNodeClinic &&
        !createNewManager &&
        parentClinicId &&
        renderSelectManager()}

      {(isParentClinic || (createNewManager && !!parentClinicId)) && (
        <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <p className="text-sm max-sm:text-center font-medium text-primary-accent">
            {isParentClinic
              ? "Create a manager for this new clinic"
              : "Create a new manager for this branch"}
          </p>

          <FormSection title="Personal Information">
            <FormGrid columns={2}>
              <ControlledTextField
                path="newManager.firstName"
                label="First Name"
                required
                inputClassName="bg-white"
              />
              <ControlledTextField
                path="newManager.lastName"
                label="Last Name"
                required
                inputClassName="bg-white"
              />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gender</Label>
                <ControlledSelectField
                  path="newManager.gender"
                  label=""
                  options={GENDER_OPTIONS}
                  placeholder="Select gender"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Age</Label>
                <Input
                  type="number"
                  min={0}
                  max={150}
                  value={
                    (newManager as Record<string, number> | null | undefined)
                      ?.age ?? ""
                  }
                  onChange={(e) =>
                    handleNewManagerChange(
                      "age",
                      e.target.value ? parseInt(e.target.value, 10) : undefined,
                    )
                  }
                  placeholder="Enter age"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Status <span className="text-red-400">*</span>
                </Label>
                <ControlledSelectField
                  className="bg-white"
                  path="newManager.status"
                  label=""
                  options={MANAGER_STATUS_OPTIONS}
                  placeholder="Select status"
                  required
                />
              </div>
            </FormGrid>
          </FormSection>

          <FormSection title="Contact Information">
            <FormGrid columns={2}>
              <div className="space-y-2">
                <ControlledTextField
                  path="newManager.email"
                  label="Manager Email"
                  type="email"
                  required
                  inputClassName="bg-white"
                  placeholder="Enter email address"
                />
                <p className="text-xs text-500">
                  {isParentClinic
                    ? "Login email for the manager account. Must be unique and not already registered."
                    : 'Login email for the manager account. If this person already has an account, choose "Select Existing Manager/s" instead.'}
                </p>
              </div>
              <div className="space-y-2">
                <ControlledTextField
                  path="newManager.phone"
                  label="Phone"
                  type="tel"
                  inputClassName="bg-white"
                  placeholder="+1 555 123 4567"
                  transformOnBlur={(value) => normalizePhone(value)}
                />
                <p className="text-xs text-500">{PHONE_FORMAT_HINT}</p>
              </div>
            </FormGrid>
          </FormSection>

          <FormSection title="Location">
            <FormGrid columns={2}>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Country</Label>
                <Input
                  className="bg-white"
                  value={
                    (newManager as Record<string, string> | null | undefined)
                      ?.country || ""
                  }
                  onChange={(e) =>
                    handleNewManagerChange("country", e.target.value)
                  }
                  placeholder="Enter country"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">State</Label>
                <Input
                  className="bg-white"
                  value={
                    (newManager as Record<string, string> | null | undefined)
                      ?.state || ""
                  }
                  onChange={(e) =>
                    handleNewManagerChange("state", e.target.value)
                  }
                  placeholder="Enter state"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <Input
                  className="bg-white"
                  value={
                    (newManager as Record<string, string> | null | undefined)
                      ?.city || ""
                  }
                  onChange={(e) =>
                    handleNewManagerChange("city", e.target.value)
                  }
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Postal Code</Label>
                <Input
                  className="bg-white"
                  value={
                    (newManager as Record<string, string> | null | undefined)
                      ?.postalCode || ""
                  }
                  onChange={(e) =>
                    handleNewManagerChange("postalCode", e.target.value)
                  }
                  placeholder="Enter postal code"
                />
              </div>
              <div className="w-full space-y-2 col-span-2">
                <Label className="text-sm font-medium">Complete Address</Label>
                <Input
                  className="bg-white"
                  value={
                    (newManager as Record<string, string> | null | undefined)
                      ?.completeAddress || ""
                  }
                  onChange={(e) =>
                    handleNewManagerChange("completeAddress", e.target.value)
                  }
                  placeholder="Enter complete address"
                />
              </div>
            </FormGrid>
          </FormSection>

          <PermissionsGrantField path="newManager.perms" targetRole="MANAGER" />
        </div>
      )}
    </FormSection>
  );
};
