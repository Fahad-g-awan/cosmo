export const toTreatmentResultDto = (treatmentResult) => {
  if (!treatmentResult) return null;

  const { clinicTreatment, treatment, ...rest } = treatmentResult;

  if (rest.ownerType === "ADMIN") {
    return {
      ...rest,
      treatmentId: rest.treatmentId ?? treatment?.id,
      treatmentName: rest.treatmentName ?? treatment?.name,
      treatmentImage: rest.treatmentImage ?? treatment?.image,
      treatmentOverview: rest.treatmentOverview ?? treatment?.overview,
    };
  }

  if (rest.ownerType === "CLINIC") {
    return {
      ...rest,
      clinicTreatmentId: rest.clinicTreatmentId ?? clinicTreatment?.id,
      treatmentId:
        rest.treatmentId ?? clinicTreatment?.treatmentId ?? treatment?.id,
      treatmentName:
        rest.treatmentName ??
        clinicTreatment?.treatmentName ??
        clinicTreatment?.treatment?.name ??
        treatment?.name,
      treatmentImage:
        rest.treatmentImage ??
        clinicTreatment?.treatmentImage ??
        clinicTreatment?.treatment?.image ??
        treatment?.image,
      treatmentOverview:
        rest.treatmentOverview ??
        clinicTreatment?.treatment?.overview ??
        treatment?.overview,
      categoryId: rest.categoryId ?? clinicTreatment?.categoryId,
      categoryName: rest.categoryName ?? clinicTreatment?.categoryName,
      clinicId: rest.clinicId ?? clinicTreatment?.clinicId,
      clinicName: rest.clinicName ?? clinicTreatment?.clinic?.name,
      clinicLogo: rest.clinicLogo ?? clinicTreatment?.clinic?.logo,
      clinicAddress:
        rest.clinicAddress ?? clinicTreatment?.clinic?.completeAddress,
      clinicRating: rest.clinicRating ?? clinicTreatment?.clinic?.avgRating,
      clinicReviewCount:
        rest.clinicReviewCount ?? clinicTreatment?.clinic?.reviewCount,
    };
  }

  return {
    ...rest,
    clinicTreatmentId: rest.clinicTreatmentId ?? clinicTreatment?.id,
    treatmentId: rest.treatmentId ?? clinicTreatment?.treatmentId ?? treatment?.id,
    categoryId: rest.categoryId ?? clinicTreatment?.categoryId,
    categoryName: rest.categoryName ?? clinicTreatment?.categoryName,
    clinicId: rest.clinicId ?? clinicTreatment?.clinicId,
  };
};
