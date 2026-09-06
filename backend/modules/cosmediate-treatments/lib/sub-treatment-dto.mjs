/**
 * API shape for a clinic offering sub-treatment row.
 *
 * @param {import("@prisma/client").SubTreatment & { brands?: Array<{ brand: { id: string, name: string, published?: boolean } }> }} row
 * @returns {object|null}
 */
export const toSubTreatmentDto = (row) => {
  if (!row) return null;

  const brands = (row.brands ?? [])
    .map((junction) => junction.brand)
    .filter(Boolean)
    .map((brand) => ({
      id: brand.id,
      name: brand.name,
      published: brand.published ?? true,
      entityType: "ENTITY_TYPE#TREATMENT_BRAND",
    }));

  return {
    id: row.id,
    clinicTreatmentId: row.clinicTreatmentId,
    clinicId: row.clinicId,
    treatmentId: row.treatmentId,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    name: row.name,
    price: row.price,
    duration: row.duration,
    available: row.available,
    brands,
    entityType: row.entityType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};
