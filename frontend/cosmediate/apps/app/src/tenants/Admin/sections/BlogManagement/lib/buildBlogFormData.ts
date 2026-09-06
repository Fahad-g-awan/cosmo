import { ALLOWED_FIELDS } from "../constants/blogs.constants";
import { BlogFormValues } from "../types/blog.types";

const hasUploadableImage = (value: unknown): boolean => {
  if (value instanceof File) return true;
  return typeof value === "string" && value.trim().length > 0;
};

export const buildBlogFormData = (
  data: Partial<BlogFormValues>,
  extra: Record<string, unknown> = {},
): FormData => {
  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (!ALLOWED_FIELDS.has(key) || value === undefined || value === null) {
      return;
    }

    if (key === "blogImage") {
      if (hasUploadableImage(value)) {
        requestData[key] = value;
      }
      return;
    }

    if (key === "tags") {
      if (Array.isArray(value) && value.length > 0) {
        requestData.tags = value;
      }
      return;
    }

    if (typeof value === "string" && value.trim() === "") return;

    requestData[key] = value;
  });

  const formData = new FormData();

  Object.entries(requestData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (typeof value === "object" && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "string" || value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};
