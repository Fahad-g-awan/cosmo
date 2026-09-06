/**
 * API shape for a clinic offering (`ClinicTreatment` hub row).
 *
 * @param {import("@prisma/client").ClinicTreatment} clinicTreatment
 * @returns {object}
 */
export const toClinicTreatmentDto = (clinicTreatment) => {
  if (!clinicTreatment) return null;

  const { treatment, ...rest } = clinicTreatment;

  return {
    id: rest.id,
    clinicId: rest.clinicId,
    treatmentId: rest.treatmentId,
    status: rest.status,
    categoryId: rest.categoryId ?? treatment?.categoryId,
    categoryName: rest.categoryName ?? treatment?.category?.name,
    treatmentName: rest.treatmentName ?? treatment?.name,
    treatmentImage: rest.treatmentImage ?? treatment?.image,
    treatmentOverview: rest.treatmentOverview ?? treatment?.overview,
    avgPrice: rest.avgPrice ?? 0,
    minPrice: rest.minPrice ?? 0,
    maxPrice: rest.maxPrice ?? 0,
    available: rest.status === "ACTIVE",
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
  };
};
