import {
  loadClinicTreatmentFacets,
  loadSpecialistTreatmentFacets,
  loadTreatmentPriceRollup,
} from "/opt/nodejs/services/prisma/org/treatment/treatment-price-aggregates.mjs";

export const persistTreatmentPriceAggregates = async (prisma, treatmentId) => {
  if (!treatmentId) return { minPrice: 0, maxPrice: 0, avgPrice: 0 };

  const prices = await loadTreatmentPriceRollup(prisma, treatmentId);
  await prisma.treatment.update({
    where: { id: treatmentId },
    data: prices,
  });
  return prices;
};

export const persistClinicPriceAggregates = async (prisma, clinicId) => {
  if (!clinicId) return { minPrice: 0, maxPrice: 0, avgPrice: 0 };

  const { minPrice, maxPrice, avgPrice } = await loadClinicTreatmentFacets(
    prisma,
    clinicId,
  );
  await prisma.clinic.update({
    where: { id: clinicId },
    data: { minPrice, maxPrice, avgPrice },
  });
  return { minPrice, maxPrice, avgPrice };
};

export const persistSpecialistPriceAggregates = async (prisma, specialistId) => {
  if (!specialistId) return { minPrice: 0, maxPrice: 0, avgPrice: 0 };

  const { minPrice, maxPrice, avgPrice } = await loadSpecialistTreatmentFacets(
    prisma,
    specialistId,
  );
  await prisma.specialist.update({
    where: { id: specialistId },
    data: { minPrice, maxPrice, avgPrice },
  });
  return { minPrice, maxPrice, avgPrice };
};

export const persistSpecialistPriceAggregatesForIds = async (
  prisma,
  specialistIds = [],
) => {
  const ids = [...new Set(specialistIds)].filter(Boolean);
  await Promise.all(
    ids.map((specialistId) => persistSpecialistPriceAggregates(prisma, specialistId)),
  );
  return ids;
};

/**
 * After a hub's sub-treatment prices change, refresh clinic, master treatment,
 * and every specialist assigned to that offering.
 */
export const cascadePriceAggregatesFromClinicTreatment = async (
  prisma,
  clinicTreatmentId,
) => {
  if (!clinicTreatmentId) {
    return { clinicId: null, treatmentId: null, specialistIds: [] };
  }

  const hub = await prisma.clinicTreatment.findUnique({
    where: { id: clinicTreatmentId },
    select: { clinicId: true, treatmentId: true },
  });
  if (!hub) {
    return { clinicId: null, treatmentId: null, specialistIds: [] };
  }

  const assignments = await prisma.clinicSpecialistTreatment.findMany({
    where: { clinicTreatmentId, deleted: false },
    select: { specialistId: true },
  });
  const specialistIds = [...new Set(assignments.map((row) => row.specialistId))];

  await Promise.all([
    persistClinicPriceAggregates(prisma, hub.clinicId),
    persistTreatmentPriceAggregates(prisma, hub.treatmentId),
    persistSpecialistPriceAggregatesForIds(prisma, specialistIds),
  ]);

  return {
    clinicId: hub.clinicId,
    treatmentId: hub.treatmentId,
    specialistIds,
  };
};

/**
 * When clinic offerings are added/removed, refresh clinic + affected master treatments
 * and specialists still tied to those hubs at the clinic.
 */
export const cascadePriceAggregatesForClinicOfferingSync = async (
  prisma,
  { clinicId, treatmentIds = [] },
) => {
  const uniqueTreatmentIds = [...new Set(treatmentIds)].filter(Boolean);

  const assignmentRows = uniqueTreatmentIds.length
    ? await prisma.clinicSpecialistTreatment.findMany({
        where: {
          clinicId,
          treatmentId: { in: uniqueTreatmentIds },
          deleted: false,
        },
        select: { specialistId: true },
      })
    : [];

  const specialistIds = [
    ...new Set(assignmentRows.map((row) => row.specialistId)),
  ];

  await persistClinicPriceAggregates(prisma, clinicId);
  await Promise.all(
    uniqueTreatmentIds.map((treatmentId) =>
      persistTreatmentPriceAggregates(prisma, treatmentId),
    ),
  );
  await persistSpecialistPriceAggregatesForIds(prisma, specialistIds);

  return { specialistIds };
};
