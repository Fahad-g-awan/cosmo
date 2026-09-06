import { ControlledTextField, FormSection } from "@cosmediate/form-ui";

export const TagsSection = () => {
  return (
    <FormSection title="Tags">
      <ControlledTextField
        path="tags"
        label="Add multiple tags"
        type="tags"
        placeholder="Type and press Enter"
        required
      />
    </FormSection>
  );
};
