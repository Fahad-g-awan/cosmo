export const toTreatmentBrandDto = (brand) => {
  if (!brand) return null;

  return { ...brand };
};
