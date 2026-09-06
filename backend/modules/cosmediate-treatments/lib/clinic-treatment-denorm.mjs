/**
 * Copy denorm fields from master Treatment (+ category) onto a ClinicTreatment row.
 */
export const buildClinicTreatmentDenormFromTreatment = (treatment) => ({
  categoryId: treatment.categoryId,
  categoryName: treatment.category?.name ?? "",
  treatmentName: treatment.name,
  treatmentImage: treatment.image ?? null,
  treatmentOverview: treatment.overview ?? null,
});
