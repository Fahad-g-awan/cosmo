import { ControlledSelectField } from "@cosmediate/form-ui";
import type { SelectOption } from "@cosmediate/form-ui/fields/ControlledSelectField";
import { STATUS_OPTIONS } from "../../constants/patient.constants";

export const StatusSection = () => {
  return (
    <div className="w-full">
      <ControlledSelectField
        options={STATUS_OPTIONS.map((opt: SelectOption) => ({
          value: opt.value,
          label: opt.label,
        }))}
        label="Status"
        path="status"
        placeholder="Select status"
        required
        clearable={false}
      />
    </div>
  );
};
