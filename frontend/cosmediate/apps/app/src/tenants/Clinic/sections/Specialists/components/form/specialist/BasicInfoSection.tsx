import {
  ControlledSelectField,
  ControlledTextareaField,
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";
import { useFormValue } from "@cosmediate/form-core";
import { Input, Label } from "@cosmediate/ui/index";

import {
  OVERVIEW_MAX_LENGTH,
  OVERVIEW_MIN_LENGTH,
} from "@app/lib/form-field-limits";
import { normalizePhone, PHONE_FORMAT_HINT } from "@app/lib/phone";

import { GENDER_OPTIONS } from "../../../constants/specialist.constants";

export const BasicInfoSection = ({ isUpdate }: { isUpdate: boolean }) => {
  const firstName = useFormValue<string>("firstName");
  const lastName = useFormValue<string>("lastName");
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  return (
    <FormSection title="Basic Information" className="w-full space-y-4">
      <FormGrid columns={3}>
        <ControlledTextField path="firstName" label="First Name" required />
        <ControlledTextField path="lastName" label="Last Name" required />
        <div className="space-y-2">
          <Label className="text-sm font-medium">Full Name</Label>
          <Input
            value={fullName}
            readOnly
            placeholder="Auto-generated"
            className="bg-gray-50"
          />
        </div>
      </FormGrid>

      <div className="w-full space-y-2">
        <ControlledTextareaField
          className="w-full max-lg:col-span-2"
          path="overview"
          label="Overview"
          required
          maxLength={OVERVIEW_MAX_LENGTH}
        />
        <p className="text-xs text-500">
          Short summary for specialist listings. {OVERVIEW_MIN_LENGTH}–
          {OVERVIEW_MAX_LENGTH} characters.
        </p>
      </div>

      <FormGrid columns={3}>
        <ControlledTextField path="age" label="Age" type="number" />
        <ControlledSelectField
          path="gender"
          label="Gender"
          options={GENDER_OPTIONS}
        />

        <ControlledTextField
          path="totalExperience"
          label="Total Experience (years)"
          type="number"
        />
      </FormGrid>

      <FormGrid columns={2}>
        <div className="w-full space-y-2">
          <ControlledTextField
            path="email"
            label="Email"
            type="email"
            required
            disabled={isUpdate}
          />
          {isUpdate && (
            <p className="w-full text-xs text-500">Email cannot be changed</p>
          )}
        </div>
        <div className="w-full space-y-2">
          <ControlledTextField
            path="phone"
            label="Phone"
            type="tel"
            placeholder="+1 555 123 4567"
            transformOnBlur={(value) => normalizePhone(value)}
          />
          <p className="text-xs text-500">{PHONE_FORMAT_HINT}</p>
        </div>
        <ControlledTextField
          path="website"
          label="Website"
          placeholder="https://"
        />
        <ControlledTextField
          path="instagramId"
          label="Instagram ID"
          placeholder="@clinicname"
        />
      </FormGrid>

      <FormGrid columns={2}>
        <ControlledTextField path="country" label="Country" />
        <ControlledTextField path="state" label="State" />
        <ControlledTextField path="city" label="City" />
        <ControlledTextField path="postalCode" label="Postal Code" />
      </FormGrid>

      <ControlledTextareaField
        path="completeAddress"
        label="Complete Address"
        placeholder="Enter complete address"
        rows={3}
      />
    </FormSection>
  );
};
