import { loadTreatmentPriceRollup } from "/opt/nodejs/services/prisma/org/treatment/treatment-price-aggregates.mjs";
import { loadTreatmentAggregateCounts } from "../lib/treatment-aggregate-reindex.mjs";

export const getTreatmentById = async (prisma, treatmentId) => {
  if (!treatmentId) {
    return {
      treatment: null,
      errors: ["Treatment ID not provided"],
      ok: false,
    };
  }

  const treatment = await prisma.treatment.findFirst({
    where: { id: treatmentId, deleted: false },
    include: {
      category: {
        select: { id: true, name: true },
      },
      clinicSpecialistTreatments: {
        where: {
          deleted: false,
          status: "ACTIVE",
          specialist: { deleted: false },
          clinic: { deleted: false },
        },
        include: {
          specialist: {
            select: {
              id: true,
              fullName: true,
              image: true,
              completeAddress: true,
              avgRating: true,
              reviewCount: true,
              available: true,
            },
          },
          clinic: {
            select: {
              id: true,
              name: true,
              logo: true,
              completeAddress: true,
              avgRating: true,
              reviewCount: true,
              avgPrice: true,
              minPrice: true,
              maxPrice: true,
              available: true,
            },
          },
        },
      },
      clinicTreatments: {
        where: { deleted: false, status: "ACTIVE" },
        select: {
          clinicId: true,
          clinic: {
            select: {
              id: true,
              name: true,
              logo: true,
              completeAddress: true,
              avgRating: true,
              reviewCount: true,
              avgPrice: true,
              minPrice: true,
              maxPrice: true,
              available: true,
            },
          },
        },
      },
      _count: {
        select: {
          clinicSpecialistTreatments: {
            where: { deleted: false, status: "ACTIVE" },
          },
          clinicTreatments: { where: { deleted: false, status: "ACTIVE" } },
        },
      },
    },
  });

  if (!treatment) {
    return {
      errors: [`Treatment does not exist: ${treatmentId}`],
      treatment: null,
      ok: false,
    };
  }

  const [{ clinicCount, specialistCount }, prices] = await Promise.all([
    loadTreatmentAggregateCounts(prisma, treatmentId),
    loadTreatmentPriceRollup(prisma, treatmentId),
  ]);

  return {
    errors: [],
    treatment: { ...treatment, clinicCount, specialistCount, ...prices },
    ok: true,
  };
};

export const getPublishedTreatmentById = async (prisma, treatmentId) => {
  const result = await getTreatmentById(prisma, treatmentId);
  if (!result.ok) return result;
  if (!result.treatment.published) {
    return {
      errors: [`Treatment is not published: ${treatmentId}`],
      treatment: null,
      ok: false,
    };
  }
  return result;
};
