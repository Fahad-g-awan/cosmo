/**
 * API shape for a specialist assignment to a clinic offering.
 *
 * @param {import("@prisma/client").ClinicSpecialistTreatment} row
 * @returns {object|null}
 */
export const toClinicSpecialistTreatmentDto = (row) => {
  if (!row) return null;

  const hub = row.clinicTreatment;

  return {
    id: row.id,
    clinicTreatmentId: row.clinicTreatmentId,
    clinicId: row.clinicId,
    specialistId: row.specialistId,
    treatmentId: row.treatmentId,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    treatmentName: row.treatmentName,
    treatmentImage: row.treatmentImage,
    treatmentOverview: row.treatmentOverview,
    specialistExperience: row.specialistExperience,
    status: row.status,
    available: row.available,
    minPrice: row.minPrice ?? hub?.minPrice ?? 0,
    maxPrice: row.maxPrice ?? hub?.maxPrice ?? 0,
    avgPrice: row.avgPrice ?? hub?.avgPrice ?? 0,
    searchClicks: row.searchClicks ?? 0,
    entityType: row.entityType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};
