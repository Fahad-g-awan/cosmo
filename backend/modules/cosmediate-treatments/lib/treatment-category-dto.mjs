export const toTreatmentCategoryDto = (category) => {
  if (!category) return null;

  const { _count, ...rest } = category;

  return {
    ...rest,
    treatmentCount: category.treatmentCount ?? _count?.treatments ?? 0,
  };
};
