import {
  ControlledTextareaField,
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";

import {
  OVERVIEW_MAX_LENGTH,
  OVERVIEW_MIN_LENGTH,
} from "@app/lib/form-field-limits";
import { normalizePhone, PHONE_FORMAT_HINT } from "@app/lib/phone";

export const BasicInfoSection = () => {
  return (
    <FormSection title="Basic Information" className="w-full space-y-4">
      <ControlledTextField
        className="w-full max-lg:col-span-2"
        path="name"
        label="Clinic Name"
        type="text"
        required
      />

      <div className="w-full space-y-2">
        <ControlledTextareaField
          className="w-full max-lg:col-span-2"
          path="overview"
          label="Overview"
          required
          maxLength={OVERVIEW_MAX_LENGTH}
        />
        <p className="text-xs text-500">
          Short summary for clinic listings. {OVERVIEW_MIN_LENGTH}–
          {OVERVIEW_MAX_LENGTH} characters.
        </p>
      </div>

      <FormGrid columns={2}>
        <div className="space-y-2">
          <ControlledTextField
            path="email"
            label="Clinic Email"
            type="email"
            required
          />
          <p className="text-xs text-500">
            Public contact email for this clinic.
          </p>
        </div>
        <div className="space-y-2">
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
        className="w-full max-lg:col-span-2"
        path="completeAddress"
        label="Complete Address"
        placeholder="Enter complete address"
        rows={3}
      />

      <ControlledTextField
        path="clinicAge"
        label="Clinic Age (years)"
        type="number"
        placeholder="e.g. 5"
      />
    </FormSection>
  );
};
