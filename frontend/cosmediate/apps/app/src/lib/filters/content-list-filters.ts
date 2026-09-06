import { format, isValid, parseISO } from "date-fns";

import type {
  AsyncFilterFetchFn,
  FilterConfig,
} from "@cosmediate/browse-manager";

import { normalizeMinMaxRange, normalizeTupleRange } from "./list-filter-utils";

export type ContentListEntity =
  | "blog"
  | "blog_category"
  | "announcement"
  | "treatment"
  | "treatment_category"
  | "treatment_brand"
  | "treatment_result";

const PUBLISHED_OPTIONS = [
  { label: "Published", value: "true" },
  { label: "Unpublished", value: "false" },
] as const;

const BLOG_STATUS_OPTIONS = [
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Hidden", value: "HIDDEN" },
] as const;

const ANNOUNCEMENT_STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Expired", value: "EXPIRED" },
] as const;

const ANNOUNCEMENT_SEVERITY_OPTIONS = [
  { label: "Info", value: "INFO" },
  { label: "Success", value: "SUCCESS" },
  { label: "Warning", value: "WARNING" },
  { label: "Error", value: "ERROR" },
] as const;

export const COUNT_RANGE_MAX = 100;
export const PRICE_RANGE_MAX = 10000;
export const SEARCH_CLICKS_RANGE_MAX = 10000;

export const buildPriceRangeFilter = (
  id = "price",
  label = "Price range",
  max = PRICE_RANGE_MAX,
): FilterConfig => ({
  type: "range-dropdown",
  id,
  label,
  min: 0,
  max,
  step: 50,
  defaultValue: [0, max],
});

export const buildSearchClicksRangeFilter = (
  max = SEARCH_CLICKS_RANGE_MAX,
): FilterConfig => ({
  type: "range-dropdown",
  id: "searchClicks",
  label: "Search clicks",
  min: 0,
  max,
  step: 1,
  defaultValue: [0, max],
});

export const buildPublishedBooleanFilter = (): FilterConfig => ({
  type: "select",
  id: "published",
  label: "Publication",
  options: [...PUBLISHED_OPTIONS],
  defaultValue: [],
});

export const buildTreatmentCategoryFilter = (
  options: { label: string; value: string }[] = [],
): FilterConfig => ({
  type: "multiselect",
  id: "categoryId",
  label: "Category",
  options,
  defaultValue: [],
  placeholder: "Select categories",
});

export const buildTreatmentCategoryAsyncFilter = (
  asyncFetch: AsyncFilterFetchFn,
): FilterConfig => ({
  type: "async-multiselect",
  id: "categoryId",
  label: "Category",
  defaultValue: [],
  placeholder: "Select categories",
  asyncFetch,
});

export const buildTreatmentBrandAsyncFilter = (
  asyncFetch: AsyncFilterFetchFn,
): FilterConfig => ({
  type: "async-multiselect",
  id: "brands",
  label: "Brands",
  defaultValue: [],
  placeholder: "Select brands",
  asyncFetch,
});

export const buildTreatmentFilter = (
  options: { label: string; value: string }[] = [],
): FilterConfig => ({
  type: "select",
  id: "treatmentId",
  label: "Treatment",
  options,
  defaultValue: [],
  placeholder: "All treatments",
});

export const buildTreatmentAsyncFilter = (
  asyncFetch: AsyncFilterFetchFn,
): FilterConfig => ({
  type: "async-select",
  id: "treatmentId",
  label: "Treatment",
  defaultValue: "",
  placeholder: "All treatments",
  asyncFetch,
});

export const buildBlogCategoryFilter = (
  options: { label: string; value: string }[] = [],
): FilterConfig => ({
  type: "multiselect",
  id: "categoryId",
  label: "Category",
  options,
  defaultValue: [],
  placeholder: "Select categories",
});

export const buildBlogCategoryAsyncFilter = (
  asyncFetch: AsyncFilterFetchFn,
): FilterConfig => ({
  type: "async-multiselect",
  id: "categoryId",
  label: "Category",
  defaultValue: [],
  placeholder: "Select categories",
  asyncFetch,
});

export const buildCountRangeFilter = (
  id: string,
  label: string,
  max = COUNT_RANGE_MAX,
): FilterConfig => ({
  type: "range-dropdown",
  id,
  label,
  min: 0,
  max,
  step: 1,
  defaultValue: [0, max],
});

export const buildBlogStatusFilter = (): FilterConfig => ({
  type: "select",
  id: "status",
  label: "Status",
  options: [...BLOG_STATUS_OPTIONS],
  defaultValue: [],
});

export const buildAnnouncementStatusFilter = (): FilterConfig => ({
  type: "select",
  id: "status",
  label: "Status",
  options: [...ANNOUNCEMENT_STATUS_OPTIONS],
  defaultValue: [],
});

export const buildAnnouncementSeverityFilter = (): FilterConfig => ({
  type: "select",
  id: "severity",
  label: "Severity",
  options: [...ANNOUNCEMENT_SEVERITY_OPTIONS],
  defaultValue: [],
});

export const buildBlogAuthorAsyncFilter = (
  asyncFetch: AsyncFilterFetchFn,
): FilterConfig => ({
  type: "async-select",
  id: "authorId",
  label: "Author",
  defaultValue: "",
  placeholder: "All authors",
  asyncFetch,
});

export const buildContentDateRangeFilters = (
  includePublishedAt = false,
): FilterConfig[] => {
  const filters: FilterConfig[] = [
    {
      type: "range-date",
      id: "createdAt",
      label: "Create Date",
      defaultValue: [null, null],
    },
    {
      type: "range-date",
      id: "updatedAt",
      label: "Updated Date",
      defaultValue: [null, null],
    },
  ];

  if (includePublishedAt) {
    filters.push({
      type: "range-date",
      id: "publishedAt",
      label: "Published Date",
      defaultValue: [null, null],
    });
  }

  return filters;
};

const toDateString = (value: unknown): string | null => {
  if (value == null || value === "") return null;

  if (value instanceof Date && isValid(value)) {
    return format(value, "yyyy-MM-dd");
  }

  if (typeof value === "string") {
    const parsed = parseISO(value);
    if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  }

  return null;
};

const normalizeDateRange = (
  value: unknown,
): [string | null, string | null] | undefined => {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const from = toDateString(value[0]);
  const to = toDateString(value[1]);
  if (!from && !to) return undefined;
  return [from, to];
};

const normalizeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const out = value.map(String).filter(Boolean);
  return out.length ? out : undefined;
};

const normalizePublishedBoolean = (value: unknown): boolean | undefined => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;

  const values = normalizeStringArray(value);
  if (!values || values.length !== 1) return undefined;

  if (values[0] === "true") return true;
  if (values[0] === "false") return false;
  return undefined;
};

const normalizeStatus = (value: unknown): string | string[] | undefined => {
  const values = normalizeStringArray(value);
  if (!values) {
    if (typeof value === "string" && value) return value;
    return undefined;
  }
  return values.length === 1 ? values[0] : values;
};

const normalizeNumericRange = (
  value: unknown,
  max = COUNT_RANGE_MAX,
): [number, number] | undefined => {
  if (!Array.isArray(value) || value.length !== 2) return undefined;

  const min = Number(value[0]);
  const upper = Number(value[1]);
  if (Number.isNaN(min) || Number.isNaN(upper)) return undefined;
  if (min === 0 && upper === max) return undefined;

  return [min, upper];
};

/** Maps browse-manager filter values to OpenSearch list query filters. */
export const normalizeContentListFilters = (
  filters: Record<string, unknown> | undefined,
  {
    entity,
    extra,
  }: {
    entity: ContentListEntity;
    extra?: Record<string, unknown>;
  },
): Record<string, unknown> | undefined => {
  if (!filters && !extra) return undefined;

  const out: Record<string, unknown> = {};

  if (filters) {
    const createdAt = normalizeDateRange(filters.createdAt);
    if (createdAt) out.createdAt = createdAt;

    const updatedAt = normalizeDateRange(filters.updatedAt);
    if (updatedAt) out.updatedAt = updatedAt;

    const publishedAt = normalizeDateRange(filters.publishedAt);
    if (publishedAt) out.publishedAt = publishedAt;

    switch (entity) {
      case "blog": {
        const status = normalizeStatus(filters.status);
        if (status) out.status = status;

        const categoryId = normalizeStringArray(filters.categoryId);
        if (categoryId) out.categoryId = categoryId;

        const authorId = normalizeStringArray(filters.authorId);
        if (authorId) out.authorId = authorId;
        break;
      }
      case "blog_category": {
        const published = normalizePublishedBoolean(filters.published);
        if (published !== undefined) out.published = published;

        const blogCount = normalizeNumericRange(filters.blogCount);
        if (blogCount) out.blogCount = blogCount;
        break;
      }
      case "announcement": {
        const status = normalizeStatus(filters.status);
        if (status) out.status = status;

        const severity = normalizeStatus(filters.severity);
        if (severity) out.severity = severity;

        const startsAt = normalizeDateRange(filters.startsAt);
        if (startsAt) out.startsAt = startsAt;

        const endsAt = normalizeDateRange(filters.endsAt);
        if (endsAt) out.endsAt = endsAt;
        break;
      }
      case "treatment_category": {
        const published = normalizePublishedBoolean(filters.published);
        if (published !== undefined) out.published = published;

        const treatmentCount = normalizeNumericRange(filters.treatmentCount);
        if (treatmentCount) out.treatmentCount = treatmentCount;
        break;
      }
      case "treatment_brand": {
        const published = normalizePublishedBoolean(filters.published);
        if (published !== undefined) out.published = published;
        break;
      }
      case "treatment": {
        const published = normalizePublishedBoolean(filters.published);
        if (published !== undefined) out.published = published;

        const categoryId = normalizeStringArray(filters.categoryId);
        if (categoryId) out.categoryId = categoryId;

        const brands = normalizeStringArray(filters.brands);
        if (brands) out.brands = brands;

        normalizeTupleRange(filters.price, "price", out, {
          defaultMin: 0,
          defaultMax: PRICE_RANGE_MAX,
        });

        const specialistCount = normalizeNumericRange(filters.specialistCount);
        if (specialistCount) out.specialistCount = specialistCount;

        const clinicCount = normalizeNumericRange(filters.clinicCount);
        if (clinicCount) out.clinicCount = clinicCount;

        normalizeMinMaxRange(filters.searchClicks, "searchClicks", out, {
          defaultMin: 0,
          defaultMax: SEARCH_CLICKS_RANGE_MAX,
        });
        break;
      }
      case "treatment_result": {
        const ownerType = normalizeStatus(filters.ownerType);
        if (ownerType) out.ownerType = ownerType;

        const treatmentId = normalizeStatus(filters.treatmentId);
        if (treatmentId) out.treatmentId = treatmentId;
        break;
      }
      default:
        break;
    }
  }

  if (extra) {
    Object.assign(out, extra);
  }

  return Object.keys(out).length ? out : undefined;
};
