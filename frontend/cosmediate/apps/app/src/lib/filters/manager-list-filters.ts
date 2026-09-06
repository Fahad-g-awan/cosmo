import type {
  AsyncFilterFetchFn,
  FilterConfig,
} from "@cosmediate/browse-manager";

import {
  normalizeAgeRange,
  normalizeCheckboxBoolean,
  normalizeDateRange,
  normalizeMinMaxRange,
  normalizeSingleString,
  normalizeStringArray,
} from "./list-filter-utils";
import {
  buildContentDateRangeFilters,
  buildCountRangeFilter,
  COUNT_RANGE_MAX,
} from "./content-list-filters";

const MANAGER_STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Pending", value: "PENDING" },
  { label: "Unconfirmed", value: "UNCONFIRMED" },
] as const;

export interface ManagerBrowseAsyncFetchers {
  clinicId: AsyncFilterFetchFn;
}

export interface BuildManagerListFiltersOptions {
  /** When false, omits clinic picker (workspace injects scopeClinicId). */
  includeClinicFilter?: boolean;
}

const buildAsyncSelectFilter = (
  id: string,
  label: string,
  asyncFetch: AsyncFilterFetchFn,
  placeholder: string,
): FilterConfig => ({
  type: "async-select",
  id,
  label,
  defaultValue: "",
  placeholder,
  asyncFetch,
});

export const buildManagerListFilters = (
  asyncFetch: ManagerBrowseAsyncFetchers,
  { includeClinicFilter = true }: BuildManagerListFiltersOptions = {},
): FilterConfig[] => {
  const filters: FilterConfig[] = [];

  if (includeClinicFilter) {
    filters.push(
      buildAsyncSelectFilter(
        "clinicId",
        "Clinic",
        asyncFetch.clinicId,
        "All clinics",
      ),
    );
  }

  filters.push(
    {
      type: "multiselect",
      id: "status",
      label: "Status",
      options: [...MANAGER_STATUS_OPTIONS],
      defaultValue: [],
      placeholder: "Select status",
    },
    {
      type: "range-slider",
      id: "age",
      label: "Age",
      min: 0,
      max: 120,
      step: 1,
      defaultValue: [0, 120],
    },
    {
      type: "checkbox",
      id: "passwordSet",
      label: "Password set",
      options: [{ label: "Yes", value: "true" }],
      defaultValue: [],
    },
    {
      type: "checkbox",
      id: "defaultPasswordUsed",
      label: "Default password used",
      options: [{ label: "Yes", value: "true" }],
      defaultValue: [],
    },
    buildCountRangeFilter("clinicCount", "Clinics", COUNT_RANGE_MAX),
    ...buildContentDateRangeFilters(),
  );

  return filters;
};

/** Maps browse-manager values to manager OpenSearch list filters. */
export const normalizeManagerListFilters = (
  filters?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!filters) return undefined;

  const out: Record<string, unknown> = {};

  const clinicId = normalizeSingleString(filters.clinicId);
  if (clinicId) out.clinicId = clinicId;

  const scopeClinicId = normalizeSingleString(filters.scopeClinicId);
  if (scopeClinicId) out.scopeClinicId = scopeClinicId;

  const status = normalizeStringArray(filters.status);
  if (status) out.status = status;

  const age = normalizeAgeRange(filters.age);
  if (age) out.age = age;

  const passwordSet = normalizeCheckboxBoolean(filters.passwordSet);
  if (passwordSet !== undefined) out.passwordSet = passwordSet;

  const defaultPasswordUsed = normalizeCheckboxBoolean(
    filters.defaultPasswordUsed,
  );
  if (defaultPasswordUsed !== undefined) {
    out.defaultPasswordUsed = defaultPasswordUsed;
  }

  normalizeMinMaxRange(filters.clinicCount, "clinicCount", out, {
    defaultMin: 0,
    defaultMax: COUNT_RANGE_MAX,
  });

  const createdAt = normalizeDateRange(filters.createdAt);
  if (createdAt) out.createdAt = createdAt;

  const updatedAt = normalizeDateRange(filters.updatedAt);
  if (updatedAt) out.updatedAt = updatedAt;

  return Object.keys(out).length ? out : undefined;
};
