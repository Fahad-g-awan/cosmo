import {
  ControlledTextareaField,
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";

export const LocationSection = () => {
  return (
    <FormSection title="Location">
      <FormGrid columns={2} className="lg:grid-cols-1 xl:grid-cols-2">
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
