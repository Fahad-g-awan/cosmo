export const mapTreatmentCategorySearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    name: data?.name,
    published: data?.published,
    treatmentCount: data?.treatmentCount ?? 0,
  };
  doc.searchableText = doc.name ?? "";
  return doc;
};
