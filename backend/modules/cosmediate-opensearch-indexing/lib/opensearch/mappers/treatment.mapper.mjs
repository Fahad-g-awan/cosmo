import { joinText, extractPlainTextFromHtmlJson } from "../documents.mjs";

export const mapTreatmentSearchDocument = (baseDoc, data) => {
  const faqs = Array.isArray(data?.faqs) ? data.faqs : [];
  const tags = Array.isArray(data?.tags) ? data.tags : [];

  const doc = {
    ...baseDoc,
    image: data?.image ?? "",
    name: data?.name,
    overview: data?.overview,
    recoveryTime: data?.recoveryTime,
    anesthesia: data?.anesthesia,
    faqs,
    tags,
    published: data?.published,
    categoryId: data?.categoryId,
    categoryName: data?.categoryName ?? null,
    authorId: data?.authorId,
    authorName: data?.authorName,
    authorEmail: data?.authorEmail,
    searchClicks: data?.searchClicks ?? 0,
    clinicCount: data?.clinicCount ?? 0,
    specialistCount: data?.specialistCount ?? 0,
    avgPrice: data?.avgPrice ?? 0,
    minPrice: data?.minPrice ?? 0,
    maxPrice: data?.maxPrice ?? 0,
    brandIds: Array.isArray(data?.brandIds) ? data.brandIds : [],
  };

  const faqText = faqs.flatMap((f) => [
    f?.question,
    extractPlainTextFromHtmlJson(f?.answer),
  ]);

  doc.searchableText = joinText([
    doc.name,
    doc.overview,
    doc.categoryName,
    doc.recoveryTime,
    doc.anesthesia,
    doc.authorName,
    doc.authorEmail,
    ...faqText,
    ...tags,
  ]);

  return doc;
};
