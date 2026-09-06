import type {
  AsyncFilterFetchFn,
  FilterConfig,
} from "@cosmediate/browse-manager";

import {
  buildContentDateRangeFilters,
  buildTreatmentAsyncFilter,
  buildPriceRangeFilter,
  buildSearchClicksRangeFilter,
  COUNT_RANGE_MAX,
  PRICE_RANGE_MAX,
} from "./content-list-filters";
import {
  normalizeAgeRange,
  normalizeCheckboxBoolean,
  normalizeDateRange,
  normalizeMinMaxRange,
  normalizeSingleString,
  normalizeStringArray,
  normalizeTupleRange,
} from "./list-filter-utils";

const WORKING_TYPE_OPTIONS = [
  { label: "Full time", value: "FULL_TIME" },
  { label: "Freelance", value: "FREELANCE" },
] as const;

const SPECIALIST_STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Pending", value: "PENDING" },
  { label: "Unconfirmed", value: "UNCONFIRMED" },
] as const;

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
] as const;

export interface SpecialistBrowseAsyncFetchers {
  clinicId: AsyncFilterFetchFn;
  treatmentCategories: AsyncFilterFetchFn;
  brands: AsyncFilterFetchFn;
  treatmentId: AsyncFilterFetchFn;
}

export type ClinicSpecialistBrowseAsyncFetchers = Omit<
  SpecialistBrowseAsyncFetchers,
  "clinicId"
>;

export interface BuildSpecialistListFiltersOptions {
  /** When false, omits clinic picker (clinic dashboard uses workspace clinicId). */
  includeClinicFilter?: boolean;
}

const buildAsyncMultiselectFilter = (
  id: string,
  label: string,
  asyncFetch: AsyncFilterFetchFn,
  placeholder: string,
): FilterConfig => ({
  type: "async-multiselect",
  id,
  label,
  defaultValue: [],
  placeholder,
  asyncFetch,
});

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

export const buildSpecialistListFilters = (
  asyncFetch:
    | SpecialistBrowseAsyncFetchers
    | ClinicSpecialistBrowseAsyncFetchers,
  { includeClinicFilter = true }: BuildSpecialistListFiltersOptions = {},
): FilterConfig[] => {
  const filters: FilterConfig[] = [
    {
      type: "select",
      id: "workingType",
      label: "Working type",
      options: [...WORKING_TYPE_OPTIONS],
      defaultValue: [],
      placeholder: "All types",
    },
  ];

  if (includeClinicFilter && "clinicId" in asyncFetch) {
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
      options: [...SPECIALIST_STATUS_OPTIONS],
      defaultValue: [],
      placeholder: "Select status",
    },
    {
      type: "multiselect",
      id: "gender",
      label: "Gender",
      options: [...GENDER_OPTIONS],
      defaultValue: [],
      placeholder: "Select gender",
    },
    {
      type: "checkbox",
      id: "available",
      label: "Available",
      options: [{ label: "Yes", value: "true" }],
      defaultValue: [],
    },
  );

  filters.push(
    buildAsyncMultiselectFilter(
      "treatmentCategories",
      "Treatment categories",
      asyncFetch.treatmentCategories,
      "Select categories",
    ),
    buildAsyncMultiselectFilter(
      "brands",
      "Brands",
      asyncFetch.brands,
      "Select brands",
    ),
    buildTreatmentAsyncFilter(asyncFetch.treatmentId),
    {
      type: "range-slider",
      id: "rating",
      label: "Rating",
      min: 0,
      max: 5,
      step: 0.1,
      defaultValue: [0, 5],
    },
    buildPriceRangeFilter(),
    {
      type: "range-slider",
      id: "treatmentCount",
      label: "Treatments",
      min: 0,
      max: COUNT_RANGE_MAX,
      step: 1,
      defaultValue: [0, COUNT_RANGE_MAX],
    },
    {
      type: "range-slider",
      id: "reviewCount",
      label: "Reviews",
      min: 0,
      max: COUNT_RANGE_MAX,
      step: 1,
      defaultValue: [0, COUNT_RANGE_MAX],
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
      type: "range-slider",
      id: "totalExperience",
      label: "Experience (years)",
      min: 0,
      max: 60,
      step: 1,
      defaultValue: [0, 60],
    },
    buildSearchClicksRangeFilter(),
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
    ...buildContentDateRangeFilters(),
  );

  return filters;
};

/** Maps browse-manager values to specialist OpenSearch list filters. */
export const normalizeSpecialistListFilters = (
  filters?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!filters) return undefined;

  const out: Record<string, unknown> = {};

  const workingType = normalizeSingleString(filters.workingType);
  if (workingType) out.workingType = workingType;

  const clinicId = normalizeSingleString(filters.clinicId);
  if (clinicId) out.clinicId = clinicId;

  const status = normalizeStringArray(filters.status);
  if (status) out.status = status;

  const gender = normalizeStringArray(filters.gender);
  if (gender) out.gender = gender;

  const available = normalizeCheckboxBoolean(filters.available);
  if (available !== undefined) out.available = available;

  const passwordSet = normalizeCheckboxBoolean(filters.passwordSet);
  if (passwordSet !== undefined) out.passwordSet = passwordSet;

  const defaultPasswordUsed = normalizeCheckboxBoolean(
    filters.defaultPasswordUsed,
  );
  if (defaultPasswordUsed !== undefined) {
    out.defaultPasswordUsed = defaultPasswordUsed;
  }

  const treatmentCategories = normalizeStringArray(filters.treatmentCategories);
  if (treatmentCategories) out.treatmentCategories = treatmentCategories;

  const brands = normalizeStringArray(filters.brands);
  if (brands) out.brands = brands;

  const treatmentId = normalizeSingleString(filters.treatmentId);
  if (treatmentId) out.treatmentId = treatmentId;

  normalizeTupleRange(filters.price, "price", out, {
    defaultMin: 0,
    defaultMax: PRICE_RANGE_MAX,
  });

  if (Array.isArray(filters.rating) && filters.rating.length === 2) {
    const min = Number(filters.rating[0]);
    if (!Number.isNaN(min) && min > 0) out.rating = min;
  }

  normalizeMinMaxRange(filters.treatmentCount, "treatmentCount", out, {
    defaultMin: 0,
    defaultMax: COUNT_RANGE_MAX,
  });
  normalizeMinMaxRange(filters.reviewCount, "reviewCount", out, {
    defaultMin: 0,
    defaultMax: COUNT_RANGE_MAX,
  });

  const age = normalizeAgeRange(filters.age);
  if (age) {
    if (age[0] != null) out.ageMin = age[0];
    if (age[1] != null) out.ageMax = age[1];
  }

  normalizeMinMaxRange(filters.totalExperience, "totalExperience", out, {
    defaultMin: 0,
    defaultMax: 60,
  });

  normalizeMinMaxRange(filters.searchClicks, "searchClicks", out, {
    defaultMin: 0,
    defaultMax: 10000,
  });

  const createdAt = normalizeDateRange(filters.createdAt);
  if (createdAt) out.createdAt = createdAt;

  const updatedAt = normalizeDateRange(filters.updatedAt);
  if (updatedAt) out.updatedAt = updatedAt;

  return Object.keys(out).length ? out : undefined;
};
