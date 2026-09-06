import { useFormSetValue, useFormValue } from "@cosmediate/form-core";
import {
  ControlledSelectField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";
import {
  WOKING_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "../../../constants/specialist.constants";
import { Label, Switch } from "@cosmediate/ui";

export const WorkingTypeSection = ({
  isUpdate = false,
  clinicDashboard = false,
}: {
  isUpdate?: boolean;
  clinicDashboard?: boolean;
}) => {
  const available = useFormValue<boolean>("available");
  const setValue = useFormSetValue();

  const workingTypeOptions = clinicDashboard
    ? WOKING_TYPE_OPTIONS.filter((opt) => opt.value === "FULL_TIME")
    : WOKING_TYPE_OPTIONS;

  return (
    <FormSection title="Clinic Type & Status">
      <FormGrid columns={2}>
        <ControlledSelectField
          path="workingType"
          label="Working Type"
          options={workingTypeOptions}
          required
          disabled={isUpdate || clinicDashboard}
        />
        <ControlledSelectField
          path="status"
          label="Status"
          options={STATUS_OPTIONS}
          required
        />
      </FormGrid>
      {isUpdate && !clinicDashboard && (
        <p className="text-xs text-500">
          Working type cannot be changed after creation.
        </p>
      )}
      {clinicDashboard && !isUpdate && (
        <p className="text-xs text-500">
          Clinic managers can only add full-time specialists.
        </p>
      )}
      <div className="flex items-center gap-3">
        <Switch
          id="available"
          checked={available}
          onCheckedChange={(checked) => setValue("available", checked)}
        />
        <Label htmlFor="available" className="text-sm">
          Specialist is available for appointment booking
        </Label>
      </div>
    </FormSection>
  );
};
