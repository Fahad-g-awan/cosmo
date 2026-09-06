export const getCategoryById = async (prisma, categoryId) => {
  if (!categoryId) {
    return {
      category: null,
      errors: ["Category ID not provided"],
      ok: false,
    };
  }

  const category = await prisma.blogCategory.findFirst({
    where: { id: categoryId, deleted: false },
  });

  if (!category) {
    return {
      category: null,
      errors: [`Blog category does not exist: ${categoryId}`],
      ok: false,
    };
  }

  return { category, errors: [], ok: true };
};
