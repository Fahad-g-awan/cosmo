/** API shape for clinic category reads. */
export const toClinicCategoryDto = (category) => {
  if (!category) return null;

  const { _count, ...rest } = category;

  return {
    ...rest,
    clinicCount: category.clinicCount ?? _count?.clinics ?? 0,
  };
};
