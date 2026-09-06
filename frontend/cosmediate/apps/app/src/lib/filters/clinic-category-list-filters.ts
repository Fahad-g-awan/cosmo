import type { FilterConfig } from "@cosmediate/browse-manager";

import {
  buildContentDateRangeFilters,
  buildCountRangeFilter,
  buildPublishedBooleanFilter,
  COUNT_RANGE_MAX,
} from "./content-list-filters";
import {
  normalizeDateRange,
  normalizePublishedBoolean,
  normalizeTupleRange,
} from "./list-filter-utils";

export const buildClinicCategoryListFilters = (): FilterConfig[] => [
  buildPublishedBooleanFilter(),
  buildCountRangeFilter("clinicCount", "Clinic count", COUNT_RANGE_MAX),
  ...buildContentDateRangeFilters(),
];

/** Maps browse-manager values to clinic-category OpenSearch list filters. */
export const normalizeClinicCategoryListFilters = (
  filters?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!filters) return undefined;

  const out: Record<string, unknown> = {};

  const published = normalizePublishedBoolean(filters.published);
  if (published !== undefined) out.published = published;

  normalizeTupleRange(filters.clinicCount, "clinicCount", out, {
    defaultMin: 0,
    defaultMax: COUNT_RANGE_MAX,
  });

  const createdAt = normalizeDateRange(filters.createdAt);
  if (createdAt) out.createdAt = createdAt;

  const updatedAt = normalizeDateRange(filters.updatedAt);
  if (updatedAt) out.updatedAt = updatedAt;

  return Object.keys(out).length ? out : undefined;
};
