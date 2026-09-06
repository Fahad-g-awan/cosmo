import {
  ControlledTextField,
  ControlledTextareaField,
  FormSection,
} from "@cosmediate/form-ui";
import { OVERVIEW_MAX_LENGTH } from "@app/lib/form-field-limits";

export const TitleSection = () => {
  return (
    <FormSection title="Blog Data">
      <ControlledTextField
        className="w-full max-lg:col-span-2"
        path="title"
        label="Title"
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
          A short summary that appears in blog listings. Max{" "}
          {OVERVIEW_MAX_LENGTH} characters.
        </p>
      </div>
    </FormSection>
  );
};
