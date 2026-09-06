import type {
  AsyncFilterFetchFn,
  FilterConfig,
} from "@cosmediate/browse-manager";

import {
  buildContentDateRangeFilters,
  buildSearchClicksRangeFilter,
  COUNT_RANGE_MAX,
  PRICE_RANGE_MAX,
} from "./content-list-filters";
import {
  normalizeCheckboxBoolean,
  normalizeDateRange,
  normalizeMinMaxRange,
  normalizeSingleString,
  normalizeStringArray,
  normalizeTupleRange,
} from "./list-filter-utils";

const CLINIC_TYPE_OPTIONS = [
  { label: "Parent", value: "PARENT" },
  { label: "Branch", value: "NODE" },
] as const;

const CLINIC_STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Pending", value: "PENDING" },
  { label: "Unconfirmed", value: "UNCONFIRMED" },
] as const;

export interface ClinicBrowseAsyncFetchers {
  clinicCategories: AsyncFilterFetchFn;
  treatmentCategories: AsyncFilterFetchFn;
  brands: AsyncFilterFetchFn;
  treatmentId: AsyncFilterFetchFn;
  parentClinicId: AsyncFilterFetchFn;
  specialistId: AsyncFilterFetchFn;
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

export const buildClinicListFilters = (
  asyncFetch: ClinicBrowseAsyncFetchers,
): FilterConfig[] => [
  {
    type: "select",
    id: "clinicType",
    label: "Clinic type",
    options: [...CLINIC_TYPE_OPTIONS],
    defaultValue: [],
    placeholder: "All types",
  },
  {
    type: "multiselect",
    id: "status",
    label: "Status",
    options: [...CLINIC_STATUS_OPTIONS],
    defaultValue: [],
    placeholder: "Select status",
  },
  buildAsyncMultiselectFilter(
    "clinicCategories",
    "Clinic categories",
    asyncFetch.clinicCategories,
    "Select categories",
  ),
  buildAsyncMultiselectFilter(
    "treatmentCategories",
    "Treatment categories",
    asyncFetch.treatmentCategories,
    "Select treatment categories",
  ),
  buildAsyncMultiselectFilter(
    "brands",
    "Brands",
    asyncFetch.brands,
    "Select brands",
  ),
  buildAsyncSelectFilter(
    "treatmentId",
    "Treatment",
    asyncFetch.treatmentId,
    "All treatments",
  ),
  buildAsyncSelectFilter(
    "parentClinicId",
    "Parent clinic",
    asyncFetch.parentClinicId,
    "All parent clinics",
  ),
  buildAsyncSelectFilter(
    "specialistId",
    "Specialist",
    asyncFetch.specialistId,
    "All specialists",
  ),
  {
    type: "checkbox",
    id: "available",
    label: "Available for booking",
    options: [{ label: "Yes", value: "true" }],
    defaultValue: [],
  },
  {
    type: "range-slider",
    id: "rating",
    label: "Rating",
    min: 0,
    max: 5,
    step: 0.1,
    defaultValue: [0, 5],
  },
  {
    type: "range-dropdown",
    id: "price",
    label: "Price range",
    min: 0,
    max: PRICE_RANGE_MAX,
    step: 50,
    defaultValue: [0, PRICE_RANGE_MAX],
  },
  {
    type: "range-slider",
    id: "specialistCount",
    label: "Specialists",
    min: 0,
    max: COUNT_RANGE_MAX,
    step: 1,
    defaultValue: [0, COUNT_RANGE_MAX],
  },
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
    id: "clinicAge",
    label: "Clinic age (years)",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: [0, 100],
  },
  buildSearchClicksRangeFilter(),
  ...buildContentDateRangeFilters(),
];

/** Maps browse-manager values to clinic OpenSearch list filters. */
export const normalizeClinicListFilters = (
  filters?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!filters) return undefined;

  const out: Record<string, unknown> = {};

  const clinicType = normalizeSingleString(filters.clinicType);
  if (clinicType) out.clinicType = clinicType;

  const status = normalizeStringArray(filters.status);
  if (status) out.status = status;

  const clinicCategories = normalizeStringArray(filters.clinicCategories);
  if (clinicCategories) out.clinicCategories = clinicCategories;

  const treatmentCategories = normalizeStringArray(filters.treatmentCategories);
  if (treatmentCategories) out.treatmentCategories = treatmentCategories;

  const brands = normalizeStringArray(filters.brands);
  if (brands) out.brands = brands;

  const treatmentId = normalizeSingleString(filters.treatmentId);
  if (treatmentId) out.treatmentId = treatmentId;

  const parentClinicId = normalizeSingleString(filters.parentClinicId);
  if (parentClinicId) out.parentClinicId = parentClinicId;

  const clinicId = normalizeSingleString(filters.clinicId);
  if (clinicId) out.clinicId = clinicId;

  const clinicIds = normalizeStringArray(filters.clinicIds);
  if (clinicIds) out.clinicIds = clinicIds;

  const specialistId = normalizeSingleString(filters.specialistId);
  if (specialistId) out.specialistId = specialistId;

  const available = normalizeCheckboxBoolean(filters.available);
  if (available !== undefined) out.available = available;

  normalizeTupleRange(filters.price, "price", out, {
    defaultMin: 0,
    defaultMax: PRICE_RANGE_MAX,
  });

  if (Array.isArray(filters.rating) && filters.rating.length === 2) {
    const min = Number(filters.rating[0]);
    if (!Number.isNaN(min) && min > 0) out.rating = min;
  }

  normalizeMinMaxRange(filters.specialistCount, "specialistCount", out, {
    defaultMin: 0,
    defaultMax: COUNT_RANGE_MAX,
  });
  normalizeMinMaxRange(filters.treatmentCount, "treatmentCount", out, {
    defaultMin: 0,
    defaultMax: COUNT_RANGE_MAX,
  });
  normalizeMinMaxRange(filters.reviewCount, "reviewCount", out, {
    defaultMin: 0,
    defaultMax: COUNT_RANGE_MAX,
  });
  normalizeMinMaxRange(filters.clinicAge, "clinicAge", out, {
    defaultMin: 0,
    defaultMax: 100,
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
