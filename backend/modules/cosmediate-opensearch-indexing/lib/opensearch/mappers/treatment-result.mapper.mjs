import { joinText } from "../documents.mjs";

export const mapTreatmentResultSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    clinicTreatmentId: data?.clinicTreatmentId ?? null,
    clinicTreatmentStatus: data?.clinicTreatmentStatus ?? null,
    clinicId: data?.clinicId ?? null,
    treatmentId: data?.treatmentId ?? null,
    ownerType: data?.ownerType,
    categoryId: data?.categoryId ?? null,
    categoryName: data?.categoryName ?? null,
    beforeImage: data?.beforeImage,
    afterImage: data?.afterImage,
    description: data?.description ?? null,
    treatmentName: data?.treatmentName ?? null,
  };

  doc.searchableText = joinText([doc.description, doc.treatmentName, doc.categoryName]);
  return doc;
};
