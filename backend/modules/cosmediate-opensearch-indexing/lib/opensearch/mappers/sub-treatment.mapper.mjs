import { joinText } from "../documents.mjs";

export const mapSubTreatmentSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    clinicTreatmentId: data?.clinicTreatmentId ?? null,
    clinicId: data?.clinicId ?? null,
    treatmentId: data?.treatmentId ?? null,
    categoryId: data?.categoryId ?? null,
    categoryName: data?.categoryName ?? null,
    clinicTreatmentStatus: data?.clinicTreatmentStatus ?? null,
    name: data?.name ?? null,
    price: data?.price ?? 0,
    duration: data?.duration ?? null,
    available: data?.available ?? true,
    brandIds: Array.isArray(data?.brandIds) ? data.brandIds : [],
  };

  doc.searchableText = joinText([doc.name, doc.categoryName]);
  return doc;
};
