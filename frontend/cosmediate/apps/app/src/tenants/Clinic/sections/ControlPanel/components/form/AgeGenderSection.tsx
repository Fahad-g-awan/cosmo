import {
  ControlledSelectField,
  ControlledTextField,
} from "@cosmediate/form-ui";
import type { SelectOption } from "@cosmediate/form-ui/fields/ControlledSelectField";
import { GENDER_OPTIONS } from "../../constants/manager.constants";

export const AgeGenderSection = () => {
  return (
    <div className="space-y-4">
      <ControlledTextField path="age" type="number" label="Age" />

      <ControlledSelectField
        options={GENDER_OPTIONS.map((opt: SelectOption) => ({
          value: opt.value,
          label: opt.label,
        }))}
        label="Gender"
        path="gender"
        placeholder="Select gender"
      />
    </div>
  );
};
