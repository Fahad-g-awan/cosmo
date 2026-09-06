const unique = (values) => [...new Set(values.filter(Boolean))];

const ACTIVE_HUB = { status: "ACTIVE", deleted: false };

/**
 * Roll up min/max/avg from hub-level price fields (themselves derived from sub-treatments).
 */
export const priceRollup = (hubs = []) => {
  const minPrices = hubs.map((h) => h.minPrice).filter((p) => p > 0);
  const maxPrices = hubs.map((h) => h.maxPrice).filter((p) => p > 0);
  const avgPrices = hubs.map((h) => h.avgPrice).filter((p) => p > 0);

  return {
    minPrice: minPrices.length ? Math.min(...minPrices) : 0,
    maxPrice: maxPrices.length ? Math.max(...maxPrices) : 0,
    avgPrice: avgPrices.length
      ? avgPrices.reduce((sum, price) => sum + price, 0) / avgPrices.length
      : 0,
  };
};

export const loadTreatmentPriceRollup = async (prisma, treatmentId) => {
  if (!treatmentId) {
    return { minPrice: 0, maxPrice: 0, avgPrice: 0 };
  }

  const hubs = await prisma.clinicTreatment.findMany({
    where: { treatmentId, deleted: false, status: "ACTIVE" },
    select: { minPrice: true, maxPrice: true, avgPrice: true },
  });

  return priceRollup(hubs);
};

/** Union of brand IDs from active sub-treatments under active hub offerings. */
export const loadTreatmentBrandIds = async (prisma, treatmentId) => {
  if (!treatmentId) return [];

  const rows = await prisma.subTreatmentBrand.findMany({
    where: {
      subTreatment: {
        treatmentId,
        deleted: false,
        clinicTreatment: ACTIVE_HUB,
      },
    },
    select: { brandId: true },
  });

  return unique(rows.map((row) => row.brandId));
};

export const loadTreatmentAggregateCounts = async (prisma, treatmentId) => {
  if (!treatmentId) {
    return { clinicCount: 0, specialistCount: 0 };
  }

  const [clinicGroups, specialistGroups] = await Promise.all([
    prisma.clinicTreatment.groupBy({
      by: ["clinicId"],
      where: { treatmentId, deleted: false, status: "ACTIVE" },
    }),
    prisma.clinicSpecialistTreatment.groupBy({
      by: ["specialistId"],
      where: { treatmentId, deleted: false, status: "ACTIVE" },
    }),
  ]);

  return {
    clinicCount: clinicGroups.length,
    specialistCount: specialistGroups.length,
  };
};

/**
 * Flat treatment facet IDs + counts + price rollup for clinic browse / OS docs.
 */
export const loadClinicTreatmentFacets = async (prisma, clinicId) => {
  const [hubs, assignments, brandRows] = await Promise.all([
    prisma.clinicTreatment.findMany({
      where: { clinicId, ...ACTIVE_HUB },
      select: {
        id: true,
        treatmentId: true,
        categoryId: true,
        categoryName: true,
        treatmentName: true,
        minPrice: true,
        maxPrice: true,
        avgPrice: true,
      },
    }),
    prisma.clinicSpecialistTreatment.findMany({
      where: {
        clinicId,
        deleted: false,
        status: "ACTIVE",
        clinicTreatment: ACTIVE_HUB,
      },
      select: { id: true },
    }),
    prisma.subTreatmentBrand.findMany({
      where: {
        subTreatment: {
          clinicId,
          deleted: false,
          clinicTreatment: ACTIVE_HUB,
        },
      },
      select: { brandId: true },
    }),
  ]);

  const prices = priceRollup(hubs);

  return {
    treatmentIds: unique(hubs.map((h) => h.treatmentId)),
    treatmentCategoryIds: unique(hubs.map((h) => h.categoryId)),
    clinicTreatmentIds: hubs.map((h) => h.id),
    clinicSpecialistTreatmentIds: assignments.map((a) => a.id),
    brandIds: unique(brandRows.map((r) => r.brandId)),
    treatmentCount: assignments.length,
    clinicTreatmentCount: hubs.length,
    ...prices,
    facetSearchTerms: unique(
      hubs.flatMap((h) => [h.treatmentName, h.categoryName]),
    ),
  };
};

/**
 * Specialist price rollup: active assignments on active hub offerings only.
 */
export const loadSpecialistTreatmentFacets = async (prisma, specialistId) => {
  const assignments = await prisma.clinicSpecialistTreatment.findMany({
    where: {
      specialistId,
      deleted: false,
      status: "ACTIVE",
      clinicTreatment: ACTIVE_HUB,
    },
    select: {
      id: true,
      treatmentId: true,
      categoryId: true,
      categoryName: true,
      treatmentName: true,
      clinicTreatmentId: true,
      clinicTreatment: {
        select: { minPrice: true, maxPrice: true, avgPrice: true },
      },
    },
  });

  const clinicTreatmentIds = unique(
    assignments.map((a) => a.clinicTreatmentId),
  );

  const brandRows = clinicTreatmentIds.length
    ? await prisma.subTreatmentBrand.findMany({
        where: {
          subTreatment: {
            deleted: false,
            clinicTreatmentId: { in: clinicTreatmentIds },
          },
        },
        select: { brandId: true },
      })
    : [];

  const hubById = new Map();
  for (const assignment of assignments) {
    if (assignment.clinicTreatment) {
      hubById.set(assignment.clinicTreatmentId, assignment.clinicTreatment);
    }
  }
  const prices = priceRollup([...hubById.values()]);

  return {
    treatmentIds: unique(assignments.map((a) => a.treatmentId)),
    treatmentCategoryIds: unique(assignments.map((a) => a.categoryId)),
    clinicSpecialistTreatmentIds: assignments.map((a) => a.id),
    brandIds: unique(brandRows.map((r) => r.brandId)),
    treatmentCount: assignments.length,
    ...prices,
    facetSearchTerms: unique(
      assignments.flatMap((a) => [a.treatmentName, a.categoryName]),
    ),
  };
};
