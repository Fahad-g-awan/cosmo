import { ControlledTextField, FormSection } from "@cosmediate/form-ui";

export const TagsSection = () => {
  return (
    <FormSection title="Tags">
      <ControlledTextField
        path="tags"
        label="Add multiple tags"
        type="tags"
        placeholder="Type and press Enter"
      />
      <p className="text-xs text-500">
        Press Enter to add each tag. Minimum 3 characters per tag.
      </p>
    </FormSection>
  );
};
