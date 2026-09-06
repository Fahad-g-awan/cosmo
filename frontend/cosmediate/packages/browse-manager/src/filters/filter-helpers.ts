import type { FilterConfig, FiltersConfig } from "./types";

const HEADER_FILTER_TYPES = new Set<FilterConfig["type"]>(["location"]);

/** Header search bar filters (location picker), not sidebar refinements. */
export const isHeaderFilter = (filter: FilterConfig): boolean =>
  HEADER_FILTER_TYPES.has(filter.type);

/** Sidebar filters — excludes header location and inactive datetime. */
export const isSidebarFilter = (filter: FilterConfig): boolean =>
  filter.type !== "location" && filter.type !== "datetime";

export const valuesEqual = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

export type FilterRecord = Record<
  string,
  { value: unknown; isDirty: boolean }
>;

export const areFilterRecordsEqual = (
  a: FilterRecord,
  b: FilterRecord,
): boolean => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of keys) {
    const filterA = a[key];
    const filterB = b[key];

    if (!filterA && !filterB) continue;
    if (!filterA || !filterB) return false;
    if (filterA.isDirty !== filterB.isDirty) return false;
    if (!valuesEqual(filterA.value, filterB.value)) return false;
  }

  return true;
};

export const getHeaderFilterIds = (config: FiltersConfig | null): string[] =>
  config?.filters?.filter(isHeaderFilter).map((f) => f.id) ?? [];

export const getSidebarFilterIds = (config: FiltersConfig | null): string[] =>
  config?.filters?.filter(isSidebarFilter).map((f) => f.id) ?? [];

export const hasPendingChangesForFilterIds = (
  pending: Record<string, { value: unknown }>,
  active: Record<string, { value: unknown }>,
  filterIds: string[],
): boolean =>
  filterIds.some(
    (id) => !valuesEqual(pending[id]?.value, active[id]?.value),
  );

export const hasActiveNonDefaultForFilters = (
  active: Record<string, { value: unknown }>,
  filters: FilterConfig[],
): boolean =>
  filters.some((f) => !valuesEqual(active[f.id]?.value, f.defaultValue));

/** Values from applied filters that differ from config defaults. */
export const extractActiveFilterValues = (
  activeFilters: Record<string, { value: unknown; isDirty: boolean }>,
  config: FiltersConfig | null,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  if (!config?.filters) return result;

  for (const filter of config.filters) {
    const value = activeFilters[filter.id]?.value;
    if (!valuesEqual(value, filter.defaultValue)) {
      result[filter.id] = value;
    }
  }

  return result;
};

const DEFAULT_DISTANCE_RANGE: [number, number] = [0, 1000];

export const DISTANCE_FILTER_ID = "distance";

export const getDistanceDefaultValue = (
  config: FiltersConfig | null,
): [number, number] => {
  const filter = config?.filters?.find((f) => f.id === DISTANCE_FILTER_ID);
  return (filter?.defaultValue as [number, number]) ?? DEFAULT_DISTANCE_RANGE;
};

export const withDistanceReset = (
  filters: Record<string, { value: unknown; isDirty: boolean }>,
  config: FiltersConfig | null,
): Record<string, { value: unknown; isDirty: boolean }> => {
  const defaultValue = getDistanceDefaultValue(config);
  return {
    ...filters,
    [DISTANCE_FILTER_ID]: { value: defaultValue, isDirty: false },
  };
};

/** True when the distance slider is narrowed from its default full range. */
export const isDistanceFilterActive = (
  activeValues: Record<string, unknown>,
  defaultRange: [number, number] = DEFAULT_DISTANCE_RANGE,
): boolean => {
  const distance = activeValues.distance;
  if (distance === undefined || distance === null) return false;
  return !valuesEqual(distance, defaultRange);
};
