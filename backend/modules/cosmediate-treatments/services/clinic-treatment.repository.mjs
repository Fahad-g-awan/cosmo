export const listClinicTreatmentsByClinic = async (prisma, clinicId) => {
  return prisma.clinicTreatment.findMany({
    where: { clinicId, deleted: false },
    select: {
      id: true,
      treatmentId: true,
      status: true,
    },
  });
};

export const getTreatmentsForOfferingSync = async (prisma, treatmentIds) => {
  if (!treatmentIds.length) return [];

  return prisma.treatment.findMany({
    where: { id: { in: treatmentIds }, deleted: false },
    include: {
      category: { select: { id: true, name: true } },
    },
  });
};

export const countActiveAssignmentsForClinicTreatment = async (
  prisma,
  clinicTreatmentId,
) => {
  return prisma.clinicSpecialistTreatment.count({
    where: {
      clinicTreatmentId,
      status: "ACTIVE",
      deleted: false,
    },
  });
};
