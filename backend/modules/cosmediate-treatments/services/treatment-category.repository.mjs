export const getCategoryById = async (prisma, categoryId) => {
  if (!categoryId) {
    return { category: null, errors: ["Category ID not provided"], ok: false };
  }

  const category = await prisma.treatmentCategory.findFirst({
    where: { id: categoryId, deleted: false },
    include: {
      _count: {
        select: { treatments: { where: { deleted: false } } },
      },
    },
  });

  if (!category) {
    return {
      errors: [`Category does not exist: ${categoryId}`],
      category: null,
      ok: false,
    };
  }

  return { errors: [], category, ok: true };
};

export const findCategoriesByNames = async (prisma, names) =>
  prisma.treatmentCategory.findMany({
    where: { name: { in: names }, deleted: false },
  });
