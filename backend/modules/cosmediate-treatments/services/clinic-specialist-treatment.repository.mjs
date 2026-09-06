export const getClinicTreatmentForAssignmentSync = async (
  prisma,
  clinicTreatmentId,
) => {
  return prisma.clinicTreatment.findFirst({
    where: {
      id: clinicTreatmentId,
      status: "ACTIVE",
      deleted: false,
    },
  });
};

export const listAssignmentsByClinicTreatment = async (
  prisma,
  clinicTreatmentId,
) => {
  return prisma.clinicSpecialistTreatment.findMany({
    where: {
      clinicTreatmentId,
      deleted: false,
      status: "ACTIVE",
    },
    orderBy: [{ treatmentName: "asc" }, { createdAt: "asc" }],
  });
};

export const getActiveClinicSpecialistLinks = async (
  prisma,
  clinicId,
  specialistIds,
) => {
  if (!specialistIds.length) return [];

  return prisma.clinicSpecialistLink.findMany({
    where: {
      clinicId,
      specialistId: { in: specialistIds },
      status: "ACTIVE",
    },
    select: { specialistId: true },
  });
};

export const collectBrandIdsForClinicTreatment = async (
  prisma,
  clinicTreatmentId,
) => {
  const rows = await prisma.subTreatmentBrand.findMany({
    where: {
      subTreatment: {
        clinicTreatmentId,
        deleted: false,
      },
    },
    select: { brandId: true },
  });

  return [...new Set(rows.map((row) => row.brandId))];
};
