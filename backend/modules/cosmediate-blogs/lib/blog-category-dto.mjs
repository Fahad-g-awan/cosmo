export const toBlogCategoryDto = (category) => {
  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    published: category.published,
    entityType: category.entityType,
    blogCount: category.blogCount ?? category._count?.blogs ?? undefined,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    deleted: category.deleted,
    deletedAt: category.deletedAt,
  };
};

export const toBlogCategoryListDto = (items = []) =>
  items.map((item) => toBlogCategoryDto(item));
