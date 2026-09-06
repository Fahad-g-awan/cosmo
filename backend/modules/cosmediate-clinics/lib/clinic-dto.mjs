const mapClinicAssignmentDto = (assignment) => {
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
    specialistId: assignment.specialistId,
    specialistName: assignment.specialist?.fullName,
    specialistImage: assignment.specialist?.image,
    completeAddress: assignment.specialist?.completeAddress,
    avgRating: assignment.specialist?.avgRating,
    reviewCount: assignment.specialist?.reviewCount,
    specialistExperience: assignment.specialistExperience,
    avgPrice: ct?.avgPrice ?? 0,
    minPrice: ct?.minPrice ?? 0,
    maxPrice: ct?.maxPrice ?? 0,
    available: assignment.available,
    treatmentResults:
      ct?.treatmentResults?.map((tr) => ({
        id: tr.id,
        beforeImage: tr.beforeImage,
        afterImage: tr.afterImage,
        description: tr.description,
        createdAt: tr.createdAt,
      })) ?? [],
    subTreatmentCount: ct?._count?.subTreatments ?? 0,
    subTreatments:
      ct?.subTreatments?.map((subt) => ({
        ...subt,
        brands: subt.brands?.map((b) => b.brand) ?? [],
      })) ?? [],
  };
};

/** Full clinic profile shape for GET responses. */
export const toClinicDetailDto = (clinic) => {
  if (!clinic) return null;

  const {
    _count,
    categories,
    managers,
    specialists,
    clinicSpecialistTreatments,
    ...rest
  } = clinic;

  return {
    ...rest,
    location: { lat: clinic.lat, lon: clinic.lon },
    categories: categories?.map((cl) => cl.category) ?? [],
    managers: managers?.map((ml) => ml.manager) ?? [],
    specialists: specialists?.map((sl) => sl.specialist) ?? [],
    treatments: clinicSpecialistTreatments?.map(mapClinicAssignmentDto) ?? [],
    managerCount: _count?.managers ?? 0,
    specialistCount: _count?.specialists ?? 0,
    treatmentCount: _count?.clinicSpecialistTreatments ?? 0,
  };
};

/** OpenSearch list item — pass through with consistent field names. */
export const toClinicListItemDto = (item) => item ?? null;
