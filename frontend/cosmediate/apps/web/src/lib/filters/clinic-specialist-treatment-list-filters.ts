const normalizeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const out = value.map(String).filter(Boolean);
  return out.length ? out : undefined;
};

/** Maps public CST browse filters to OpenSearch list query filters. */
export const normalizeClinicSpecialistTreatmentBrowseFilters = (
  filters?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!filters) return undefined;

  const out: Record<string, unknown> = {};

  if (Array.isArray(filters.price) && filters.price.length === 2) {
    out.price = filters.price;
  }

  const treatmentCategories = normalizeStringArray(filters.treatmentCategories);
  if (treatmentCategories) out.treatmentCategories = treatmentCategories;

  const brands = normalizeStringArray(filters.brands);
  if (brands) out.brands = brands;

  return Object.keys(out).length ? out : undefined;
};
