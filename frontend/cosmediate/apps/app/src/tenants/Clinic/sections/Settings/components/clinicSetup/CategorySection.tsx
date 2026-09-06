import { useMemo } from "react";

import { FormSection } from "@cosmediate/form-ui";
import { useAuth } from "@cosmediate/auth";

import {
  ControlledPaginatedAsyncSelectField,
  type PaginatedAsyncOption,
} from "@app/modules/PaginatedAsyncSelect";
import { useClinicCategoryFormFetcher } from "@app/lib/filters";

type CategorySectionProps = {
  categorySeed?: PaginatedAsyncOption[];
};

export const CategorySection = ({ categorySeed }: CategorySectionProps) => {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const fetchCategories = useClinicCategoryFormFetcher();

  const seedOptions = useMemo(
    () => (categorySeed?.length ? categorySeed : undefined),
    [categorySeed],
  );

  return (
    <FormSection title="Clinic Categories" className="w-full space-y-4">
      <ControlledPaginatedAsyncSelectField
        path="categories"
        label="Categories"
        placeholder="Select categories"
        searchPlaceholder="Search categories..."
        fetchPage={fetchCategories}
        reloadKey={accessToken ?? "no-token"}
        enabled={Boolean(accessToken)}
        disabled={!accessToken}
        seedOptions={seedOptions}
        multiple
        required
      />
    </FormSection>
  );
};
