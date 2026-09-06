import { useFormSetValue, useFormValue } from "@cosmediate/form-core";
import { ControlledSelectField, FormSection } from "@cosmediate/form-ui";
import { Label, Switch } from "@cosmediate/ui";

import { STATUS_OPTIONS } from "../../../constants/specialist.constants";

export function SpecialistStatusSection() {
  const available = useFormValue<boolean>("available");
  const setValue = useFormSetValue();

  return (
    <FormSection title="Status & availability">
      <ControlledSelectField
        path="status"
        label="Status"
        options={STATUS_OPTIONS}
        required
      />
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
}
