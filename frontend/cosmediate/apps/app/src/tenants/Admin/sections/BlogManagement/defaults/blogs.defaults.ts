import { BlogFormValues } from "../types/blog.types";

export const defaultBlogFormValues: BlogFormValues = {
  // Empty until upload — Zod still requires an image on submit
  blogImage: undefined as unknown as BlogFormValues["blogImage"],
  title: "",
  categoryId: "",
  status: undefined as unknown as BlogFormValues["status"],
  overview: "",
  publishedAt: "",
  tags: [],
  content: { type: "doc", content: [] },
};
