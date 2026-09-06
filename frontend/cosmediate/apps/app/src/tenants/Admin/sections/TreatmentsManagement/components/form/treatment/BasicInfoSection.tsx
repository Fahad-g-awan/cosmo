import { useMemo } from "react";

import {
  ControlledTextareaField,
  ControlledTextField,
  FormSection,
} from "@cosmediate/form-ui";
import { useAuth } from "@cosmediate/auth";

import {
  ControlledPaginatedAsyncSelectField,
  type PaginatedAsyncOption,
} from "@app/modules/PaginatedAsyncSelect";
import { useTreatmentCategoryFormFetcher } from "@app/lib/filters";
import { OVERVIEW_MAX_LENGTH } from "@app/lib/form-field-limits";

type BasicInfoSectionProps = {
  categorySeed?: PaginatedAsyncOption[];
};

export const BasicInfoSection = ({ categorySeed }: BasicInfoSectionProps) => {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const fetchCategories = useTreatmentCategoryFormFetcher();

  const seedOptions = useMemo(
    () => (categorySeed?.length ? categorySeed : undefined),
    [categorySeed],
  );

  return (
    <FormSection title="Treatments Preview" className="w-full space-y-4">
      <ControlledTextField
        className="w-full max-lg:col-span-2"
        path="name"
        label="Treatment Name"
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
          A short summary that appears in treatment listings. Max{" "}
          {OVERVIEW_MAX_LENGTH} characters.
        </p>
      </div>

      <ControlledPaginatedAsyncSelectField
        path="categoryId"
        label="Treatment Category"
        placeholder="Select category"
        searchPlaceholder="Search categories..."
        fetchPage={fetchCategories}
        reloadKey={accessToken ?? "no-token"}
        enabled={Boolean(accessToken)}
        disabled={!accessToken}
        seedOptions={seedOptions}
        required
        clearable
      />
    </FormSection>
  );
};
