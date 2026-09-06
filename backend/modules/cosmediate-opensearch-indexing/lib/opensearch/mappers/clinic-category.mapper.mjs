export const mapClinicCategorySearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    name: data?.name,
    published: data?.published,
    clinicCount: data?.clinicCount ?? 0,
  };
  doc.searchableText = doc.name ?? "";
  return doc;
};
