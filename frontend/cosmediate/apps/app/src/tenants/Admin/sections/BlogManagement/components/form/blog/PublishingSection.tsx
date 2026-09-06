import { useMemo } from "react";

import {
  ControlledDatePickerField,
  ControlledSelectField,
} from "@cosmediate/form-ui";
import type { SelectOption } from "@cosmediate/form-ui/fields/ControlledSelectField";
import { useAuth } from "@cosmediate/auth";

import {
  ControlledPaginatedAsyncSelectField,
  type PaginatedAsyncOption,
} from "@app/modules/PaginatedAsyncSelect";
import { useBlogCategoryFormFetcher } from "@app/lib/filters";

import { STATUS_OPTIONS } from "../../../constants/blogs.constants";

type PublishingSectionProps = {
  categorySeed?: PaginatedAsyncOption[];
};

export const PublishingSection = ({ categorySeed }: PublishingSectionProps) => {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const fetchCategories = useBlogCategoryFormFetcher();

  const seedOptions = useMemo(
    () => (categorySeed?.length ? categorySeed : undefined),
    [categorySeed],
  );

  return (
    <div className="space-y-4">
      <ControlledSelectField
        options={STATUS_OPTIONS.map((opt: SelectOption) => ({
          value: opt.value,
          label: opt.label,
        }))}
        label="Status"
        path="status"
        placeholder="Select status"
        required
        clearable={false}
      />

      <ControlledPaginatedAsyncSelectField
        path="categoryId"
        label="Blog Category"
        placeholder="Select category"
        searchPlaceholder="Search categories..."
        fetchPage={fetchCategories}
        reloadKey={accessToken ?? "no-token"}
        enabled={Boolean(accessToken)}
        disabled={!accessToken}
        seedOptions={seedOptions}
        required
      />

      <ControlledDatePickerField
        path="publishedAt"
        label="Publish Date"
        placeholder="Select date"
        required
      />
    </div>
  );
};
