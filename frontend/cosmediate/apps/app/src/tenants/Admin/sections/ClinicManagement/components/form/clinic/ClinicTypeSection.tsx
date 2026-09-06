import { useFormError, useFormSetValue, useFormValue } from "@cosmediate/form-core";
import {
  ControlledSelectField,
  FieldError,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";
import {
  CLINIC_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "../../../constants/clinic.constants";
import { Label, Switch } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

const CLINIC_TYPE_LOCKED_MESSAGE =
  "Clinic type cannot be changed after the clinic is created.";

type ClinicTypeSectionProps = {
  mode?: "create" | "update";
};

export const ClinicTypeSection = ({
  mode = "create",
}: ClinicTypeSectionProps) => {
  const available = useFormValue<boolean | undefined>("available");
  const availableError = useFormError("available");
  const setValue = useFormSetValue();
  const isUpdate = mode === "update";

  return (
    <FormSection title="Clinic Type & Status">
      <FormGrid columns={2}>
        <ControlledSelectField
          path="clinicType"
          label="Clinic Type"
          options={CLINIC_TYPE_OPTIONS}
          placeholder="Select clinic type"
          required
          disabled={isUpdate}
        />
        <ControlledSelectField
          path="status"
          label="Status"
          options={STATUS_OPTIONS}
          placeholder="Select status"
          required
        />
      </FormGrid>
      <p className="text-xs text-400">{CLINIC_TYPE_LOCKED_MESSAGE}</p>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Switch
            id="available"
            checked={available === true}
            onCheckedChange={(checked) => setValue("available", checked)}
            className={cn(availableError && "ring-1 ring-red-500 rounded-full")}
          />
          <Label htmlFor="available" className="text-sm">
            Clinic is available for bookings
          </Label>
        </div>
        <FieldError error={availableError} />
      </div>
    </FormSection>
  );
};
