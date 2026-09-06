/**
 * Loads a clinic category by id with linked clinic count.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} categoryId
 * @returns {Promise<{ category: object|null, errors: string[], ok: boolean }>}
 */
export const getCategoryById = async (prisma, categoryId) => {
  if (!categoryId) {
    return { category: null, errors: ["Category ID not provided"], ok: false };
  }

  const category = await prisma.clinicCategory.findFirst({
    where: { id: categoryId, deleted: false },
    include: {
      _count: {
        select: {
          clinics: {
            where: { clinic: { deleted: false } },
          },
        },
      },
    },
  });

  if (!category) {
    // Soft-deleted / missing: prefer name over raw id in user-facing details
    const previous = await prisma.clinicCategory.findFirst({
      where: { id: categoryId },
      select: { name: true },
    });

    return {
      errors: [
        previous?.name
          ? `Category "${previous.name}" no longer exists`
          : "Category does not exist",
      ],
      category: null,
      ok: false,
    };
  }

  return { errors: [], category, ok: true };
};

/**
 * Resolves categories by id for clinic create/update category linking.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string[]} categoryIds
 */
export const getCategoriesByIds = async (prisma, categoryIds) => {
  if (!categoryIds?.length) {
    return { categories: [], errors: [], ok: false };
  }

  const categories = await prisma.clinicCategory.findMany({
    where: { id: { in: categoryIds }, deleted: false },
  });

  const foundIds = categories.map((c) => c.id);
  const missingIds = categoryIds.filter((id) => !foundIds.includes(id));
  const errors =
    missingIds.length > 0
      ? ["One or more selected categories do not exist"]
      : [];

  return { errors, categories, ok: errors.length === 0 };
};

/**
 * Ensures category names are unique before batch create.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string[]} categories
 */
export const validateCategoryNames = async (prisma, categories) => {
  const errors = [];

  for (const category of categories) {
    if (typeof category !== "string") {
      errors.push(
        `Invalid category format at index ${categories.indexOf(category)}`,
      );
      continue;
    }

    const normalized = category.toLowerCase();
    const found = await prisma.clinicCategory.findFirst({
      where: { name: normalized, deleted: false },
    });
    if (found) errors.push(`Category already exists: ${category}`);
  }

  return { errors, ok: errors.length === 0 };
};

/** @param {import("@prisma/client").PrismaClient} prisma @param {string[]} names */
export const findCategoriesByNames = async (prisma, names) =>
  prisma.clinicCategory.findMany({
    where: { name: { in: names }, deleted: false },
  });
