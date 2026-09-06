import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";

import {
  resolveClinicIds,
  resolveParentClinicId,
  resolvePrimaryClinicLink,
} from "../services/specialist.repository.mjs";

const mapAssignmentToTreatmentDto = (assignment) => {
  const ct = assignment.clinicTreatment;
  const treatment = ct?.treatment;

  return {
    id: assignment.id,
    clinicTreatmentId: assignment.clinicTreatmentId,
    treatmentId: assignment.treatmentId,
    treatmentName: assignment.treatmentName ?? ct?.treatmentName ?? treatment?.name,
    treatmentImage: assignment.treatmentImage ?? ct?.treatmentImage ?? treatment?.image,
    treatmentOverview:
      assignment.treatmentOverview ??
      ct?.treatmentOverview ??
      treatment?.overview,
    categoryId: assignment.categoryId ?? treatment?.category?.id,
    categoryName: assignment.categoryName ?? treatment?.category?.name,
    clinicId: assignment.clinicId,
    clinicName: assignment.clinic?.name,
    clinicLogo: assignment.clinic?.logo,
    clinicAvgRating: assignment.clinic?.avgRating,
    clinicReviewCount: assignment.clinic?.reviewCount,
    clinicCompleteAddress: assignment.clinic?.completeAddress,
    specialistExperience: assignment.specialistExperience,
    avgPrice: ct?.avgPrice ?? 0,
    minPrice: ct?.minPrice ?? 0,
    maxPrice: ct?.maxPrice ?? 0,
    available: assignment.available,
    treatmentResults: (ct?.treatmentResults ?? []).map((tr) => ({
      id: tr.id,
      beforeImage: tr.beforeImage,
      afterImage: tr.afterImage,
      description: tr.description,
      createdAt: tr.createdAt,
    })),
    subTreatmentCount: ct?._count?.subTreatments ?? 0,
    subTreatments: (ct?.subTreatments ?? []).map((subt) => ({
      ...subt,
      brands: (subt.brands ?? []).map((b) => b.brand),
    })),
  };
};

const resolveSpecialistCoordinates = (profile) => {
  const lat = profile.lat ?? profile.location?.lat;
  const lon = profile.lon ?? profile.location?.lon;

  if (lat == null || lon == null) return null;

  return { lat, lon };
};

/** API shape: Specialist profile + identity auth fields + linked clinics/treatments. */
export const toSpecialistDto = (specialist) => {
  if (!specialist) return null;

  const { identity, clinics, clinicSpecialistTreatments, _count, ...profile } =
    specialist;

  const links = clinics ?? [];
  const parentClinicId =
    resolveParentClinicId(links) ?? specialist.parentClinicId ?? null;
  const parentClinicLink = resolvePrimaryClinicLink(links);

  const treatments = clinicSpecialistTreatments?.length
    ? clinicSpecialistTreatments.map(mapAssignmentToTreatmentDto)
    : specialist.treatments ?? [];

  const coordinates = resolveSpecialistCoordinates(profile);

  return {
    id: profile.id,
    identityId: profile.identityId,
    entityType: profile.entityType,
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: profile.fullName,
    specialistImage: profile.image,
    image: profile.image,
    age: profile.age,
    gender: profile.gender,
    totalExperience: profile.totalExperience,
    htmlAbout: profile.htmlAbout,
    overview: profile.overview,
    faqs: profile.faqs ?? [],
    tags: profile.tags ?? [],
    workingHours: profile.workingHours ?? [],
    certificates: profile.certificates ?? [],
    workingType: profile.workingType,
    parentClinicId,
    parentClinic: parentClinicLink?.clinic ?? specialist.parentClinic ?? null,
    clinicIds: resolveClinicIds(links).length
      ? resolveClinicIds(links)
      : specialist.clinicIds ?? [],
    clinics: links.length
      ? links.map((cl) => cl.clinic).filter(Boolean)
      : specialist.clinics ?? [],
    instagramId: profile.instagramId,
    website: profile.website,
    country: profile.country,
    state: profile.state,
    city: profile.city,
    completeAddress: profile.completeAddress,
    postalCode: profile.postalCode,
    ...(coordinates
      ? {
          lat: coordinates.lat,
          lon: coordinates.lon,
          location: coordinates,
        }
      : {}),
    available: profile.available,
    status: identity?.status ?? profile.status ?? specialist.status ?? null,
    treatments,
    clinicCount: _count?.clinics ?? specialist.clinicCount ?? 0,
    treatmentCount:
      _count?.clinicSpecialistTreatments ?? specialist.treatmentCount ?? 0,
    avgPrice: profile.avgPrice,
    minPrice: profile.minPrice,
    maxPrice: profile.maxPrice,
    avgRating: profile.avgRating,
    reviewCount: profile.reviewCount,
    searchClicks: profile.searchClicks,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    deleted: profile.deleted,
    deletedAt: profile.deletedAt,
    email: identity?.email ?? specialist.email ?? null,
    phone: identity?.phone ?? specialist.phone ?? null,
    perms: identity?.perms ?? specialist.perms ?? [],
    cognitoSub: identity?.cognitoSub ?? null,
    defaultPasswordUsed: identity?.defaultPasswordUsed ?? false,
    passwordSet: identity?.passwordSet ?? false,
    linkedProviders: identity?.linkedProviders ?? [],
    role: identity?.role ?? USER_ROLES.SPECIALIST,
  };
};
