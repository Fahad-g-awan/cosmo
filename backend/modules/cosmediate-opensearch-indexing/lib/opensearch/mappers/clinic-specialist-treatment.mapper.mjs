import { joinText } from "../documents.mjs";

export const mapClinicSpecialistTreatmentSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    clinicTreatmentId: data?.clinicTreatmentId ?? null,
    clinicId: data?.clinicId ?? null,
    specialistId: data?.specialistId ?? null,
    treatmentId: data?.treatmentId ?? null,
    categoryId: data?.categoryId ?? null,
    categoryName: data?.categoryName ?? null,
    treatmentName: data?.treatmentName ?? null,
    treatmentImage: data?.treatmentImage ?? null,
    treatmentOverview: data?.treatmentOverview ?? null,
    specialistExperience: data?.specialistExperience ?? null,
    status: data?.status ?? null,
    clinicTreatmentStatus: data?.clinicTreatmentStatus ?? null,
    available: data?.available ?? true,
    brandIds: Array.isArray(data?.brandIds) ? data.brandIds : [],
    avgPrice: data?.avgPrice ?? 0,
    minPrice: data?.minPrice ?? 0,
    maxPrice: data?.maxPrice ?? 0,
    searchClicks: data?.searchClicks ?? 0,
  };

  doc.searchableText = joinText([
    doc.treatmentName,
    doc.categoryName,
    doc.specialistExperience,
  ]);

  return doc;
};
