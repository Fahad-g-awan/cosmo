const omitRichContent = (dto) => {
  const { htmlDescription, faqs, ...rest } = dto;
  return rest;
};

export const toTreatmentDto = (treatment, { omitRichFields = false } = {}) => {
  if (!treatment) return null;

  const {
    _count,
    clinicSpecialistTreatments,
    clinicTreatments,
    category,
    ...rest
  } = treatment;

  const uniqueClinics = clinicTreatments
    ? new Map(
        clinicTreatments
          .filter((ct) => ct.clinicId)
          .map((ct) => [ct.clinicId, ct.clinic]),
      )
    : null;

  const distinctSpecialistCount = clinicSpecialistTreatments
    ? new Set(
        clinicSpecialistTreatments
          .map((st) => st.specialistId)
          .filter(Boolean),
      ).size
    : null;

  const dto = {
    ...rest,
    image: rest.image ?? null,
    categoryName: rest.categoryName ?? category?.name ?? null,
    specialistCount:
      rest.specialistCount ??
      distinctSpecialistCount ??
      _count?.clinicSpecialistTreatments ??
      0,
    clinicCount:
      rest.clinicCount ?? uniqueClinics?.size ?? _count?.clinicTreatments ?? 0,
    specialists:
      rest.specialists ??
      clinicSpecialistTreatments?.map((st) => ({
        id: st.specialist?.id ?? st.specialistId,
        name: st.specialist?.fullName,
        image: st.specialist?.image,
        completeAddress: st.specialist?.completeAddress,
        avgRating: st.specialist?.avgRating,
        reviewCount: st.specialist?.reviewCount,
        available: st.specialist?.available,
      })) ??
      [],
    clinics:
      rest.clinics ??
      (uniqueClinics
        ? Array.from(uniqueClinics.values()).map((clinic) => ({
            id: clinic.id,
            name: clinic?.name,
            logo: clinic?.logo,
            completeAddress: clinic?.completeAddress,
            avgRating: clinic?.avgRating,
            reviewCount: clinic?.reviewCount,
            avgPrice: clinic?.avgPrice,
            minPrice: clinic?.minPrice,
            maxPrice: clinic?.maxPrice,
            available: clinic?.available,
          }))
        : []),
  };

  return omitRichFields ? omitRichContent(dto) : dto;
};
