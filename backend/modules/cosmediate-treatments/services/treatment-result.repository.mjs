export const getClinicTreatmentForResult = async (prisma, clinicTreatmentId) => {
  return prisma.clinicTreatment.findFirst({
    where: {
      id: clinicTreatmentId,
      status: "ACTIVE",
      deleted: false,
    },
  });
};

export const getTreatmentRecordById = async (prisma, treatmentId) => {
  if (!treatmentId) return null;

  return prisma.treatment.findFirst({
    where: {
      id: treatmentId,
      deleted: false,
    },
  });
};

export const getTreatmentResultById = async (prisma, treatmentResultId) => {
  if (!treatmentResultId) {
    return { errors: [], treatmentResult: null, ok: false };
  }

  const treatmentResult = await prisma.treatmentResult.findFirst({
    where: {
      id: treatmentResultId,
      deleted: false,
    },
    include: {
      clinicTreatment: {
        select: {
          id: true,
          treatmentId: true,
          clinicId: true,
          treatmentName: true,
          treatmentImage: true,
          categoryId: true,
          categoryName: true,
          treatment: {
            select: { id: true, name: true, image: true, overview: true },
          },
          clinic: {
            select: {
              id: true,
              name: true,
              logo: true,
              avgRating: true,
              reviewCount: true,
              completeAddress: true,
            },
          },
        },
      },
      treatment: {
        select: { id: true, name: true, image: true, overview: true },
      },
    },
  });

  if (!treatmentResult) {
    return {
      errors: [`Treatment result does not exist: ${treatmentResultId}`],
      treatmentResult: null,
      ok: false,
    };
  }

  return { errors: [], treatmentResult, ok: true };
};
