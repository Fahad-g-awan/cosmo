import {
  normalizeSingleString,
  normalizeTupleRange,
} from "./list-filter-utils";

const normalizeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const out = value.map(String).filter(Boolean);
  return out.length ? out : undefined;
};

/** Maps public clinic browse filters to OpenSearch list query filters. */
export const normalizeClinicBrowseFilters = (
  filters?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!filters) return undefined;

  const out: Record<string, unknown> = {};

  if (Array.isArray(filters.price) && filters.price.length === 2) {
    out.price = filters.price;
  }

  const brands = normalizeStringArray(filters.brands);
  if (brands) out.brands = brands;

  const clinicCategories = normalizeStringArray(filters.clinicCategories);
  if (clinicCategories) out.clinicCategories = clinicCategories;

  const treatmentCategories = normalizeStringArray(filters.treatmentCategories);
  if (treatmentCategories) out.treatmentCategories = treatmentCategories;

  const treatmentId = normalizeSingleString(filters.treatmentId);
  if (treatmentId) out.treatmentId = treatmentId;

  normalizeTupleRange(filters.clinicAge, "clinicAge", out, {
    defaultMin: 0,
    defaultMax: 100,
  });

  if (filters.rating !== undefined && filters.rating !== null && filters.rating !== "") {
    const min = Number(filters.rating);
    if (!Number.isNaN(min) && min > 0) out.rating = min;
  }

  const location = normalizeSingleString(filters.location);
  if (location) out.location = location;

  normalizeTupleRange(filters.distance, "distance", out, {
    defaultMin: 0,
    defaultMax: 1000,
  });

  const userLocation = filters.userLocation;
  if (
    out.distance &&
    userLocation &&
    typeof userLocation === "object" &&
    "lat" in userLocation &&
    "lon" in userLocation
  ) {
    const lat = Number((userLocation as { lat: unknown }).lat);
    const lon = Number((userLocation as { lon: unknown }).lon);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      out.userLocation = { lat, lon };
    }
  }

  return Object.keys(out).length ? out : undefined;
};
