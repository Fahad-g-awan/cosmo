import {
  ControlledTextareaField,
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";

export const LocationSection = () => {
  return (
    <FormSection title="Location">
      <FormGrid columns={2} className="max-lg:grid-cols-1 grid-cols-2">
        <ControlledTextField
          className="max-lg:col-span-2"
          path="country"
          label="Country"
        />
        <ControlledTextField
          className="max-lg:col-span-2"
          path="state"
          label="State"
        />
        <ControlledTextField
          className="max-lg:col-span-2"
          path="city"
          label="City"
        />
        <ControlledTextField
          className="max-lg:col-span-2"
          path="postalCode"
          label="Postal Code"
        />
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
