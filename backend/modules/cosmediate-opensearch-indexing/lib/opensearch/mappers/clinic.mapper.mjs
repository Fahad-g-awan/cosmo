import { extractPlainTextFromHtmlJson, joinText } from "../documents.mjs";

export const mapClinicSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    logo: data?.logo || "",
    name: data?.name,
    clinicType: data?.clinicType,
    images: Array.isArray(data?.images) ? data.images : [],
    overview: data?.overview || "",
    clinicAge: data?.clinicAge || "",
    faqs: Array.isArray(data?.faqs) ? data.faqs : [],
    tags: Array.isArray(data?.tags) ? data.tags : [],
    certificates: Array.isArray(data?.certificates) ? data.certificates : [],
    workingHours: Array.isArray(data?.workingHours) ? data.workingHours : [],
    categories: Array.isArray(data?.categories) ? data.categories : [],
    phone: data?.phone,
    email: data?.email,
    website: data?.website,
    instagramId: data?.instagramId,
    country: data?.country,
    state: data?.state,
    city: data?.city,
    postalCode: data?.postalCode,
    completeAddress: data?.completeAddress,
    parentClinicId: data?.parentClinicId || "",
    categoryIds: Array.isArray(data?.categoryIds) ? data.categoryIds : [],
    brandIds: Array.isArray(data?.brandIds) ? data.brandIds : [],
    treatmentCategoryIds: Array.isArray(data?.treatmentCategoryIds)
      ? data.treatmentCategoryIds
      : [],
    treatmentIds: Array.isArray(data?.treatmentIds) ? data.treatmentIds : [],
    clinicTreatmentIds: Array.isArray(data?.clinicTreatmentIds)
      ? data.clinicTreatmentIds
      : [],
    clinicSpecialistTreatmentIds: Array.isArray(
      data?.clinicSpecialistTreatmentIds,
    )
      ? data.clinicSpecialistTreatmentIds
      : [],
    managerIds: Array.isArray(data?.managerIds) ? data.managerIds : [],
    specialistIds: Array.isArray(data?.specialistIds) ? data.specialistIds : [],
    role: data?.role || "",
    status: data?.status || "",
    available: data?.available,
    searchClicks: data?.searchClicks ?? 0,
    managerCount: data?.managerCount ?? 0,
    specialistCount: data?.specialistCount ?? 0,
    treatmentCount: data?.treatmentCount ?? 0,
    clinicTreatmentCount: data?.clinicTreatmentCount ?? 0,
    ratingSum: data?.ratingSum ?? 0,
    reviewCount: data?.reviewCount ?? 0,
    avgRating: data?.avgRating ?? 0,
    avgPrice: data?.avgPrice ?? 0,
    minPrice: data?.minPrice ?? 0,
    maxPrice: data?.maxPrice ?? 0,
  };

  if (data?.lat && data?.lon) {
    doc.location = { lat: data.lat, lon: data.lon };
  }

  const faqText = (doc.faqs || []).flatMap((f) => [
    f?.question,
    extractPlainTextFromHtmlJson(f?.answer),
  ]);
  const categoryNames = Array.isArray(data?.categories)
    ? data.categories.map((c) => c?.name)
    : [];
  const facetSearchTerms = Array.isArray(data?.facetSearchTerms)
    ? data.facetSearchTerms
    : [];

  doc.searchableText = joinText([
    doc.name,
    doc.email,
    doc.phone,
    doc.website,
    doc.instagramId,
    doc.overview,
    doc.country,
    doc.state,
    doc.city,
    doc.postalCode,
    doc.completeAddress,
    ...faqText,
    ...categoryNames,
    ...facetSearchTerms,
    ...(doc.tags || []),
  ]);

  return doc;
};
