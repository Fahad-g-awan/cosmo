import {
  extractPlainTextFromHtmlJson,
  getIdentityAuthFields,
  joinText,
} from "../documents.mjs";

export const mapSpecialistSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    ...getIdentityAuthFields(data),
    image: data?.image || "",
    firstName: data?.firstName,
    lastName: data?.lastName,
    fullName: data?.fullName,
    age: data?.age ?? null,
    gender: data?.gender ?? null,
    workingType: data?.workingType,
    totalExperience: data?.totalExperience ?? null,
    overview: data?.overview || "",
    faqs: Array.isArray(data?.faqs) ? data.faqs : [],
    tags: Array.isArray(data?.tags) ? data.tags : [],
    country: data?.country,
    state: data?.state,
    city: data?.city,
    postalCode: data?.postalCode,
    completeAddress: data?.completeAddress,
    phone: data?.phone,
    email: data?.email,
    website: data?.website,
    instagramId: data?.instagramId,
    certificates: Array.isArray(data?.certificates) ? data.certificates : [],
    workingHours: Array.isArray(data?.workingHours) ? data.workingHours : [],
    parentClinicId: data?.parentClinicId ?? "",
    clinicIds: Array.isArray(data?.clinicIds) ? data.clinicIds : [],
    clinicCount: data?.clinicCount ?? data?.clinicIds?.length ?? 0,
    brandIds: Array.isArray(data?.brandIds) ? data.brandIds : [],
    treatmentCategoryIds: Array.isArray(data?.treatmentCategoryIds)
      ? data.treatmentCategoryIds
      : [],
    treatmentIds: Array.isArray(data?.treatmentIds) ? data.treatmentIds : [],
    clinicSpecialistTreatmentIds: Array.isArray(
      data?.clinicSpecialistTreatmentIds,
    )
      ? data.clinicSpecialistTreatmentIds
      : [],
    status: data?.status || "",
    role: data?.role || "",
    defaultPasswordUsed: data?.defaultPasswordUsed,
    passwordSet: data?.passwordSet,
    perms: data?.perms,
    linkedProviders: data?.linkedProviders,
    available: data?.available,
    searchClicks: data?.searchClicks ?? 0,
    treatmentCount: data?.treatmentCount ?? 0,
    ratingSum: data?.ratingSum ?? 0,
    reviewCount: data?.reviewCount ?? 0,
    avgRating: data?.avgRating ?? 0,
    avgPrice: data?.avgPrice ?? 0,
    minPrice: data?.minPrice ?? 0,
    maxPrice: data?.maxPrice ?? 0,
  };

  if (data?.lat != null && data?.lon != null) {
    doc.location = { lat: data.lat, lon: data.lon };
  }

  const faqText = (doc.faqs || []).flatMap((f) => [
    f?.question,
    extractPlainTextFromHtmlJson(f?.answer),
  ]);
  const facetSearchTerms = Array.isArray(data?.facetSearchTerms)
    ? data.facetSearchTerms
    : [];

  doc.searchableText = joinText([
    doc.fullName,
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
    ...(doc.tags || []),
    ...faqText,
    ...facetSearchTerms,
  ]);

  return doc;
};
