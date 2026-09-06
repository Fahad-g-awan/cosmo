import { format, isValid, parseISO, endOfMonth, endOfYear, startOfMonth, startOfYear } from "date-fns";

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

const buildMonthYearRange = (
  month: unknown,
  year: unknown,
): [string | null, string | null] | undefined => {
  const monthNum = month ? Number(month) : null;
  const yearNum = year ? Number(year) : null;

  if (monthNum && !Number.isNaN(monthNum) && yearNum && !Number.isNaN(yearNum)) {
    const date = new Date(yearNum, monthNum - 1, 1);
    return [
      format(startOfMonth(date), "yyyy-MM-dd"),
      format(endOfMonth(date), "yyyy-MM-dd"),
    ];
  }

  if (yearNum && !Number.isNaN(yearNum)) {
    const date = new Date(yearNum, 0, 1);
    return [
      format(startOfYear(date), "yyyy-MM-dd"),
      format(endOfYear(date), "yyyy-MM-dd"),
    ];
  }

  if (monthNum && !Number.isNaN(monthNum)) {
    const date = new Date(new Date().getFullYear(), monthNum - 1, 1);
    return [
      format(startOfMonth(date), "yyyy-MM-dd"),
      format(endOfMonth(date), "yyyy-MM-dd"),
    ];
  }

  return undefined;
};

/** Maps public blog browse filters to OpenSearch list query filters. */
export const normalizeBlogBrowseFilters = (
  filters?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!filters) return undefined;

  const out: Record<string, unknown> = {};

  const blogCategories = normalizeStringArray(filters.blogCategories);
  if (blogCategories) out.blogCategories = blogCategories;

  const publishedAtRange = normalizeDateRange(filters.publishedAt);
  if (publishedAtRange) {
    out.publishedAt = publishedAtRange;
  } else {
    const monthYearRange = buildMonthYearRange(
      filters.publishedMonth,
      filters.publishedYear,
    );
    if (monthYearRange) out.publishedAt = monthYearRange;
  }

  return Object.keys(out).length ? out : undefined;
};
