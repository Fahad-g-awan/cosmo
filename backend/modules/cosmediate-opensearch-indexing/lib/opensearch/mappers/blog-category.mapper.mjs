export const mapBlogCategorySearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    name: data?.name,
    published: data?.published,
    blogCount: data?.blogCount ?? 0,
  };
  doc.searchableText = doc.name ?? "";
  return doc;
};
