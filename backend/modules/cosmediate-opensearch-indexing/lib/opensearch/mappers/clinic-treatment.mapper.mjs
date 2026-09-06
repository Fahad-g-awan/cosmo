import { joinText } from "../documents.mjs";

export const mapClinicTreatmentSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    clinicId: data?.clinicId ?? null,
    treatmentId: data?.treatmentId ?? null,
    categoryId: data?.categoryId ?? null,
    categoryName: data?.categoryName ?? null,
    treatmentName: data?.treatmentName ?? null,
    treatmentImage: data?.treatmentImage ?? null,
    treatmentOverview: data?.treatmentOverview ?? null,
    status: data?.status ?? null,
    avgPrice: data?.avgPrice ?? 0,
    minPrice: data?.minPrice ?? 0,
    maxPrice: data?.maxPrice ?? 0,
  };

  doc.searchableText = joinText([doc.treatmentName, doc.categoryName]);
  return doc;
};
