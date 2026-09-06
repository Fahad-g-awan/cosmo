import {
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";

export const DetailsSection = () => {
  return (
    <FormSection title="Treatment Details">
      <FormGrid columns={2}>
        <ControlledTextField
          className="w-full max-lg:col-span-2"
          path="recoveryTime"
          label="Recovery Time"
          type="text"
          required
          placeholder="3 weeks/days/months"
        />
        <ControlledTextField
          className="w-full max-lg:col-span-2"
          path="anesthesia"
          label="Anesthesia Requirement"
          type="text"
          required
          placeholder="Required local anesthesia"
        />
      </FormGrid>
    </FormSection>
  );
};
