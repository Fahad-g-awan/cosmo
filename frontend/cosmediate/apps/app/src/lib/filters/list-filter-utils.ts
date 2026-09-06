import { format, isValid, parseISO } from "date-fns";

export const toDateString = (value: unknown): string | null => {
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

export const normalizeDateRange = (
  value: unknown,
): [string | null, string | null] | undefined => {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const from = toDateString(value[0]);
  const to = toDateString(value[1]);
  if (!from && !to) return undefined;
  return [from, to];
};

export const normalizeStringArray = (
  value: unknown,
): string[] | undefined => {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const out = value.map(String).filter(Boolean);
  return out.length ? out : undefined;
};

export const normalizeSingleString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) return value.trim();
  const values = normalizeStringArray(value);
  if (values?.length === 1) return values[0];
  return undefined;
};

export const normalizeCheckboxBoolean = (
  value: unknown,
): boolean | undefined => {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  if (value.some((entry) => entry === true || entry === "true")) return true;
  return undefined;
};

export const normalizePublishedBoolean = (
  value: unknown,
): boolean | undefined => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;

  const values = normalizeStringArray(value);
  if (!values || values.length !== 1) return undefined;

  if (values[0] === "true") return true;
  if (values[0] === "false") return false;
  return undefined;
};

export const normalizeAgeRange = (
  value: unknown,
): [number | null, number | null] | undefined => {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const min = typeof value[0] === "number" ? value[0] : null;
  const max = typeof value[1] === "number" ? value[1] : null;
  if (min == null && max == null) return undefined;
  return [min, max];
};

/** Maps a browse range-slider to backend `fieldMin` / `fieldMax` keys. */
export const normalizeMinMaxRange = (
  value: unknown,
  field: string,
  out: Record<string, unknown>,
  { defaultMin, defaultMax }: { defaultMin?: number; defaultMax?: number } = {},
) => {
  if (!Array.isArray(value) || value.length !== 2) return;

  const min = Number(value[0]);
  const max = Number(value[1]);
  if (Number.isNaN(min) || Number.isNaN(max)) return;

  const minDefault = defaultMin ?? 0;
  const maxDefault = defaultMax ?? max;

  if (min !== minDefault) out[`${field}Min`] = min;
  if (max !== maxDefault) out[`${field}Max`] = max;
};

/** Maps a browse range-slider to backend `[min, max]` tuple on `field`. */
export const normalizeTupleRange = (
  value: unknown,
  field: string,
  out: Record<string, unknown>,
  { defaultMin, defaultMax }: { defaultMin?: number; defaultMax?: number } = {},
) => {
  if (!Array.isArray(value) || value.length !== 2) return;

  const min = Number(value[0]);
  const max = Number(value[1]);
  if (Number.isNaN(min) || Number.isNaN(max)) return;

  const minDefault = defaultMin ?? 0;
  const maxDefault = defaultMax ?? max;

  if (min === minDefault && max === maxDefault) return;
  out[field] = [min, max];
};
