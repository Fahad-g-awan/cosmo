import { useCallback, useEffect, useMemo, useState } from "react";

import {
  InfoMessage,
  Input,
  Label,
  Skeleton,
  ToggleMenu,
} from "@cosmediate/ui";
import {
  ControlledSelectField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";
import { useFormSetValue, useFormValue } from "@cosmediate/form-core";
import { getClinicManagersApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

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
}: {
  mode?: "create" | "update";
  clinicId?: string;
}) => {
  const newManager = useFormValue<Record<string, unknown>>("newManager");
  const parentClinicId = useFormValue<string>("parentClinicId");
  const clinicType = useFormValue<string>("clinicType");
  const setValue = useFormSetValue();
  const { session } = useAuth();

  const isParentClinic = clinicType === "PARENT";
  const isUpdateMode = mode === "update";

  // In create mode, default to createNewManager for PARENT clinics
  const [createNewManager, setCreateNewManager] = useState(
    !isUpdateMode && isParentClinic,
  );
  const [managers, setManagers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // In update mode, ensure newManager is cleared to avoid validation issues
  useEffect(() => {
    if (isUpdateMode) {
      setValue("newManager", undefined);
    }
  }, [isUpdateMode, setValue]);

  // Reset when switching to parent clinic (create mode only)
  useEffect(() => {
    if (!isUpdateMode && isParentClinic) {
      setCreateNewManager(true);
      setValue("managerIds", []);
    }
  }, [isParentClinic, setValue, isUpdateMode]);

  // Determine the clinic ID to use for fetching managers:
  // PARENT clinic → use its own ID; NODE clinic → use parentClinicId
  const managerClinicId = isParentClinic ? clinicId : parentClinicId;

  // Fetch managers for selection
  useEffect(() => {
    const fetchManagers = async () => {
      if (!managerClinicId) return;
      if (!session?.tokens?.accessToken) return;
      // In create mode, only fetch for NODE clinics (PARENT creates a new manager)
      if (!isUpdateMode && isParentClinic) return;

      setIsLoading(true);
      try {
        const response = await getClinicManagersApi(
          {
            pagination: { limit: 100 },
            filters: { parentClinicId: managerClinicId },
          },
          session.tokens.accessToken,
        );
        if (response.success && response.items) {
          setManagers(
            response.items.map((m) => ({
              id: m.id,
              name: `${m.firstName} ${m.lastName}`,
              email: m.email,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching managers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchManagers();
  }, [
    managerClinicId,
    isParentClinic,
    isUpdateMode,
    session?.tokens?.accessToken,
  ]);

  const managerOptions = useMemo(
    () =>
      managers.map((m) => ({ label: `${m.name} (${m.email})`, value: m.id })),
    [managers],
  );

  const handleNewManagerChange = useCallback(
    (field: string, value: string | number | undefined) => {
      setValue("newManager", {
        ...(newManager || {}),
        [field]: value,
        status: (newManager as Record<string, unknown>)?.status || "ACTIVE",
      });
    },
    [newManager, setValue],
  );

  const renderSelectManager = (title?: string) => {
    return (
      <FormSection title={title}>
        <div className="w-full space-y-2">
          {isLoading && <Skeleton className="w-full h-10" />}

          {!isLoading && managers.length < 1 && (
            <InfoMessage
              title="Managers data not found for selected clinic"
              message="Please try again or contact suppot"
              variant="error"
              size="sm"
            />
          )}

          {!isLoading && managers.length > 0 && (
            <ControlledSelectField
              options={managerOptions}
              label="Select Manager/s"
              path="managerIds"
              placeholder="Select manager/s"
              showSelectedItems
              showSelectAll
              required
              multiple
            />
          )}
          <p className="text-xs text-gray-500">
            Select one or more managers for this clinic
          </p>
        </div>
      </FormSection>
    );
  };

  /**
   * =================================================================
   * UPDATE MODE: only show manager selection, no create new manager
   * =================================================================
   */
  if (isUpdateMode) {
    return renderSelectManager("Manager Assignment");
  }

  /**
   * =================================================================
   * CREATE MODE: existing behavior
   * =================================================================
   */
  return (
    <FormSection title="Manager Assignment">
      {/* For NODE clinics - show toggle between select/create */}
      {/* For Parent clinic it will always be new manager */}
      {!isParentClinic && parentClinicId && (
        <ToggleMenu
          items={[
            {
              label: `Select Existing Manager/s`,
              value: "existing",
            },
            {
              label: `Create New Manager`,
              value: "new",
            },
          ]}
          value={createNewManager ? "new" : "existing"}
          onChange={(value) =>
            setCreateNewManager(value === "new" ? true : false)
          }
          className="w-full"
        />
      )}

      {/* Message for NODE clinics without parent selected */}
      {!isParentClinic && !parentClinicId && (
        <p className="text-sm text-500 p-4 bg-ghost-blue rounded-xl">
          Please select a parent clinic first to assign managers.
        </p>
      )}

      {/* Select existing managers - only for NODE clinics */}
      {!isParentClinic &&
        !createNewManager &&
        parentClinicId &&
        renderSelectManager()}

      {/* Create new manager form - for PARENT clinics or when creating new for NODE */}
      {(isParentClinic || (createNewManager && parentClinicId)) && (
        <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <p className="text-sm max-sm:text-center font-medium text-primary-accent">
            {isParentClinic
              ? "Create a manager for this new clinic"
              : "Create a new manager for this branch"}
          </p>

          {/* Personal Information */}
          <div className="space-y-3">
            <FormSection title="Personal Information">
              <FormGrid columns={2}>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    First Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    className="bg-white"
                    value={
                      (newManager as Record<string, string>)?.firstName || ""
                    }
                    onChange={(e) =>
                      handleNewManagerChange("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Last Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    className="bg-white"
                    value={
                      (newManager as Record<string, string>)?.lastName || ""
                    }
                    onChange={(e) =>
                      handleNewManagerChange("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                  />
                </div>
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
                    value={(newManager as Record<string, number>)?.age ?? ""}
                    onChange={(e) =>
                      handleNewManagerChange(
                        "age",
                        e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined,
                      )
                    }
                    placeholder="Enter age"
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
                  />
                </div>
              </FormGrid>
            </FormSection>
          </div>

          <FormSection title="Contact Information">
            <FormGrid columns={2}>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Email <span className="text-red-400">*</span>
                </Label>
                <Input
                  className="bg-white"
                  type="email"
                  value={(newManager as Record<string, string>)?.email || ""}
                  onChange={(e) =>
                    handleNewManagerChange("email", e.target.value)
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone</Label>
                <Input
                  className="bg-white"
                  value={(newManager as Record<string, string>)?.phone || ""}
                  onChange={(e) =>
                    handleNewManagerChange("phone", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>
            </FormGrid>
          </FormSection>

          <FormSection title="Location">
            <FormGrid columns={2}>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Country</Label>
                <Input
                  className="bg-white"
                  value={(newManager as Record<string, string>)?.country || ""}
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
                  value={(newManager as Record<string, string>)?.state || ""}
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
                  value={(newManager as Record<string, string>)?.city || ""}
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
                    (newManager as Record<string, string>)?.postalCode || ""
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
                    (newManager as Record<string, string>)?.completeAddress ||
                    ""
                  }
                  onChange={(e) =>
                    handleNewManagerChange("completeAddress", e.target.value)
                  }
                  placeholder="Enter complete address"
                />
              </div>
            </FormGrid>
          </FormSection>
        </div>
      )}
    </FormSection>
  );
};
