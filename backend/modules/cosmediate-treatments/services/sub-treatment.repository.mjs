const subTreatmentInclude = {
  brands: {
    where: { brand: { deleted: false } },
    include: {
      brand: {
        select: { id: true, name: true, published: true },
      },
    },
  },
};

export const getClinicTreatmentForSubTreatmentSync = async (
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

export const listSubTreatmentsByClinicTreatment = async (
  prisma,
  clinicTreatmentId,
) => {
  return prisma.subTreatment.findMany({
    where: { clinicTreatmentId, deleted: false },
    include: subTreatmentInclude,
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
  });
};

export const getSubTreatmentById = async (prisma, subTreatmentId) => {
  return prisma.subTreatment.findFirst({
    where: {
      id: subTreatmentId,
      deleted: false,
      clinicTreatment: {
        status: "ACTIVE",
        deleted: false,
      },
    },
    include: subTreatmentInclude,
  });
};

/**
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {{ filters?: Record<string, unknown>, pagination?: { limit?: number, page?: number } }} query
 * @deprecated Use sub-treatment-search.service.mjs (OpenSearch) for list routes.
 */
export const searchSubTreatmentsFromDb = async (prisma, query = {}) => {
  const filters = query.filters ?? {};
  const limit = Math.min(Math.max(query.pagination?.limit ?? 100, 1), 500);
  const page = Math.max(query.pagination?.page ?? 1, 1);
  const skip = (page - 1) * limit;

  const clinicTreatmentWhere = {
    status: "ACTIVE",
    deleted: false,
  };

  if (filters.specialistId) {
    clinicTreatmentWhere.clinicSpecialistTreatments = {
      some: {
        specialistId: filters.specialistId,
        status: "ACTIVE",
        deleted: false,
      },
    };
  }

  const where = {
    deleted: false,
    clinicTreatment: clinicTreatmentWhere,
  };

  if (filters.clinicId) where.clinicId = filters.clinicId;
  if (filters.clinicTreatmentId) where.clinicTreatmentId = filters.clinicTreatmentId;
  if (filters.treatmentId) where.treatmentId = filters.treatmentId;

  const [items, total] = await Promise.all([
    prisma.subTreatment.findMany({
      where,
      include: subTreatmentInclude,
      orderBy: [{ categoryName: "asc" }, { name: "asc" }],
      skip,
      take: limit,
    }),
    prisma.subTreatment.count({ where }),
  ]);

  return { items, total, nextToken: null };
};

export const getTreatmentBrandsByIds = async (prisma, brandIds) => {
  if (!brandIds.length) return [];

  return prisma.treatmentBrand.findMany({
    where: { id: { in: brandIds }, deleted: false },
    select: { id: true },
  });
};

/** Hydrate brand relations for sub-treatment rows returned from OpenSearch. */
export const hydrateSubTreatmentsWithBrands = async (prisma, items = []) => {
  if (!items.length) return [];

  const rows = await prisma.subTreatment.findMany({
    where: { id: { in: items.map((item) => item.id) } },
    include: subTreatmentInclude,
    orderBy: [{ categoryName: "asc" }, { name: "asc" }],
  });

  const byId = new Map(rows.map((row) => [row.id, row]));

  return items
    .map((item) => byId.get(item.id) ?? item)
    .filter(Boolean);
};

export const rollupClinicTreatmentPrices = async (tx, clinicTreatmentId) => {
  const rows = await tx.subTreatment.findMany({
    where: { clinicTreatmentId, deleted: false },
    select: { price: true },
  });

  const prices = rows.map((row) => row.price);
  const aggregates =
    prices.length > 0
      ? {
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
        }
      : { minPrice: 0, maxPrice: 0, avgPrice: 0 };

  await tx.clinicTreatment.update({
    where: { id: clinicTreatmentId },
    data: aggregates,
  });

  return aggregates;
};
