export const getBlogById = async (prisma, blogId) => {
  if (!blogId) {
    return { blog: null, errors: ["Blog ID not provided"], ok: false };
  }

  const blog = await prisma.blog.findFirst({
    where: { id: blogId, deleted: false },
    include: { category: true },
  });

  if (!blog) {
    return {
      blog: null,
      errors: [`Blog does not exist: ${blogId}`],
      ok: false,
    };
  }

  return { blog, errors: [], ok: true };
};

export const validateBlogTitleAvailable = async (
  prisma,
  title,
  excludeId = null,
) => {
  const errors = [];
  const whereClause = { title, deleted: false };

  if (excludeId) {
    whereClause.id = { not: excludeId };
  }

  const foundBlog = await prisma.blog.findFirst({ where: whereClause });

  if (foundBlog) {
    errors.push(`Blog with this title already exists: ${title}`);
  }

  return { errors, ok: errors.length === 0 };
};
