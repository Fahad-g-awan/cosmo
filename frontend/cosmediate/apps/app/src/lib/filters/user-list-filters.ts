import { format, isValid, parseISO } from "date-fns";

import type { AsyncFilterFetchFn, FilterConfig } from "@cosmediate/browse-manager";

const USER_STATUS_OPTIONS = [
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

const CREATION_SOURCE_OPTIONS = [
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Specialist", value: "SPECIALIST" },
  { label: "Self signup", value: "SELF_SIGNUP" },
] as const;

const CREATION_SOURCE_LABELS = Object.fromEntries(
  CREATION_SOURCE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

export function formatCreationSourceLabel(value?: string | null): string {
  if (!value) return "—";
  return CREATION_SOURCE_LABELS[value] ?? value;
}

export interface UserBrowseAsyncFetchers {
  clinicId?: AsyncFilterFetchFn;
  specialistId?: AsyncFilterFetchFn;
}

export interface BuildUserProfileListFiltersOptions {
  includeClinicFilter?: boolean;
  includeSpecialistFilter?: boolean;
  includeCreationSource?: boolean;
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

/** Shared browse filters for admin + patient list pages (OpenSearch-backed). */
export const buildUserProfileListFilters = (
  asyncFetch?: UserBrowseAsyncFetchers,
  {
    includeClinicFilter = false,
    includeSpecialistFilter = false,
    includeCreationSource = true,
  }: BuildUserProfileListFiltersOptions = {},
): FilterConfig[] => {
  const filters: FilterConfig[] = [];

  if (includeClinicFilter && asyncFetch?.clinicId) {
    filters.push(
      buildAsyncSelectFilter(
        "clinicId",
        "Clinic",
        asyncFetch.clinicId,
        "All clinics",
      ),
    );
  }

  if (includeSpecialistFilter && asyncFetch?.specialistId) {
    filters.push(
      buildAsyncSelectFilter(
        "specialistId",
        "Specialist",
        asyncFetch.specialistId,
        "All specialists",
      ),
    );
  }

  filters.push(
    {
      type: "multiselect",
      id: "status",
      label: "Status",
      options: [...USER_STATUS_OPTIONS],
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
  );

  if (includeCreationSource) {
    filters.push({
      type: "multiselect",
      id: "creationSource",
      label: "Creation source",
      options: [...CREATION_SOURCE_OPTIONS],
      defaultValue: [],
      placeholder: "Select source",
    });
  }

  filters.push(
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
    {
      type: "range-date",
      id: "createdAt",
      label: "Create date",
      defaultValue: [null, null],
    },
    {
      type: "range-date",
      id: "updatedAt",
      label: "Update date",
      defaultValue: [null, null],
    },
  );

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

const normalizeCheckboxBoolean = (value: unknown): boolean | undefined => {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  if (value.some((entry) => entry === true || entry === "true")) return true;
  return undefined;
};

const normalizeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const out = value.map(String).filter(Boolean);
  return out.length ? out : undefined;
};

const normalizeSingleString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) return value.trim();
  const values = normalizeStringArray(value);
  if (values?.length === 1) return values[0];
  return undefined;
};

const normalizeAgeRange = (
  value: unknown,
): [number | null, number | null] | undefined => {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const min = typeof value[0] === "number" ? value[0] : null;
  const max = typeof value[1] === "number" ? value[1] : null;
  if (min == null && max == null) return undefined;
  return [min, max];
};

/** Maps browse-manager filter values to OpenSearch list query filters. */
export const normalizeUserListFilters = (
  filters?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!filters) return undefined;

  const out: Record<string, unknown> = {};

  const clinicId = normalizeSingleString(filters.clinicId);
  if (clinicId) out.clinicId = clinicId;

  const specialistId = normalizeSingleString(filters.specialistId);
  if (specialistId) out.specialistId = specialistId;

  const status = normalizeStringArray(filters.status);
  if (status) out.status = status;

  const gender = normalizeStringArray(filters.gender);
  if (gender) out.gender = gender;

  const creationSource = normalizeStringArray(filters.creationSource);
  if (creationSource) out.creationSource = creationSource;

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

  const createdAt = normalizeDateRange(filters.createdAt);
  if (createdAt) out.createdAt = createdAt;

  const updatedAt = normalizeDateRange(filters.updatedAt);
  if (updatedAt) out.updatedAt = updatedAt;

  return Object.keys(out).length ? out : undefined;
};
