const mapBlogFields = (blog, { includeContent = false } = {}) => {
  if (!blog) return null;

  const { category, content, image, ...fields } = blog;

  const dto = {
    ...fields,
    blogImage: image ?? null,
    image: image ?? null,
    categoryName: category?.name ?? fields.categoryName ?? null,
  };

  if (includeContent) {
    dto.content = content ?? null;
  }

  return dto;
};

/** Full blog shape (includes content). */
export const toBlogDto = (blog) => mapBlogFields(blog, { includeContent: true });

/** List/card payload — excludes content. */
export const toBlogListItemDto = (blog) =>
  mapBlogFields(blog, { includeContent: false });

export const toBlogListDto = (items = []) =>
  items.map((item) => toBlogListItemDto(item));
