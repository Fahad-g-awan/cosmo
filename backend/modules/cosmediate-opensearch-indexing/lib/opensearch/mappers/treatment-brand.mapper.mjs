export const mapTreatmentBrandSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    name: data?.name,
    published: data?.published,
  };
  doc.searchableText = doc.name ?? "";
  return doc;
};
