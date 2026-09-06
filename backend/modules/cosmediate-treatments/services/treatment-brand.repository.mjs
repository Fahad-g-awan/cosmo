export const getBrandById = async (prisma, brandId) => {
  if (!brandId) {
    return { brand: null, errors: ["Brand ID not provided"], ok: false };
  }

  const brand = await prisma.treatmentBrand.findFirst({
    where: { id: brandId, deleted: false },
  });

  if (!brand) {
    return {
      errors: [`Brand does not exist: ${brandId}`],
      brand: null,
      ok: false,
    };
  }

  return { errors: [], brand, ok: true };
};

export const findBrandsByNames = async (prisma, names) =>
  prisma.treatmentBrand.findMany({
    where: { name: { in: names }, deleted: false },
  });
