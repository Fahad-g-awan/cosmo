import { joinText } from "../documents.mjs";

export const mapBlogSearchDocument = (baseDoc, data) => {
  const tags = Array.isArray(data?.tags) ? data.tags : [];

  const doc = {
    ...baseDoc,
    title: data?.title,
    overview: data?.overview,
    image: data?.image ?? "",
    status: data?.status,
    publishedAt: data?.publishedAt,
    tags,
    categoryId: data?.categoryId,
    categoryName: data?.categoryName ?? null,
    authorId: data?.authorId,
    authorName: data?.authorName,
    authorEmail: data?.authorEmail,
    searchClicks: data?.searchClicks ?? 0,
  };

  doc.searchableText = joinText([
    doc.title,
    doc.overview,
    doc.categoryName,
    doc.authorName,
    doc.authorEmail,
    ...tags,
  ]);

  return doc;
};
